"use client";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
} from "@mui/material";
import { DatabaseContext, ProductDocument } from "@swift-buy/database";
import {
  Search,
  SearchIconWrapper,
  SearchInput,
} from "@swift-buy/ui-components";
import Image from "next/image";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

const PRODUCTS_PER_LOAD = 8;

export default function Home() {
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState("");

  const { database } = useContext(DatabaseContext);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductDocument[]>([]);
  const [productsInCart, setProductsInCart] = useState<ProductDocument[]>([]);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      if (database) {
        const products = await database.collections.products
          .find()
          .limit(PRODUCTS_PER_LOAD)
          .exec();
        setSkip(PRODUCTS_PER_LOAD);
        setProducts(products);

        const me = (await database.collections.me.find().exec())[0];
        const productsInCart: ProductDocument[] = await me.populate(
          "productsInCart"
        );
        setProductsInCart(productsInCart);

        setLoading(false);
      }
    };

    fetchProducts();
  }, [database, setSkip]);

  const trimmedSearchQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  const filtredProducts = useMemo(() => {
    if (trimmedSearchQuery.length) {
      return products.filter((product) => {
        return (
          product.title
            .toLowerCase()
            .includes(trimmedSearchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(trimmedSearchQuery.toLowerCase())
        );
      });
    }

    return products;
  }, [products, trimmedSearchQuery]);

  const highlightSearchQuery = useCallback(
    (text: string) => {
      if (!trimmedSearchQuery.length) {
        return [<span key={0}>{text}</span>];
      }

      const tokens = [];

      let textCopy = text;

      while (textCopy.length) {
        const searchQueryIndex = textCopy
          .toLowerCase()
          .indexOf(trimmedSearchQuery.toLowerCase());

        if (searchQueryIndex !== -1) {
          tokens.push(
            <span key={tokens.length}>
              {textCopy.slice(0, searchQueryIndex)}
            </span>
          );

          tokens.push(
            <span key={tokens.length} style={{ backgroundColor: "#FBF719" }}>
              {textCopy.slice(
                searchQueryIndex,
                searchQueryIndex + trimmedSearchQuery.length
              )}
            </span>
          );

          textCopy = textCopy.slice(
            searchQueryIndex + trimmedSearchQuery.length
          );
        } else {
          tokens.push(<span key={tokens.length}>{textCopy}</span>);
          break;
        }
      }

      return tokens;
    },
    [trimmedSearchQuery]
  );

  const observerTarget = useRef(null);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);

  useEffect(() => {
    if (filtredProducts.length && !noMorePosts) {
      const fetchMorePosts = async () => {
        if (database) {
          setLoadingMorePosts(true);

          await new Promise((resolve) => setTimeout(() => resolve(null), 2000));

          const moreProducts = await database.collections.products
            .find()
            .limit(PRODUCTS_PER_LOAD)
            .skip(skip)
            .exec();

          setSkip(skip + PRODUCTS_PER_LOAD);
          setProducts([...products, ...moreProducts]);
          setNoMorePosts(moreProducts.length < 8);
          setLoadingMorePosts(false);
        }
      };

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchMorePosts();
          }
        },
        { threshold: 1 }
      );

      if (observerTarget.current) {
        observer.observe(observerTarget.current);
      }

      const observerTargetCurrent = observerTarget.current;

      return () => {
        if (observerTargetCurrent) {
          observer.unobserve(observerTargetCurrent);
        }
      };
    }
  }, [
    database,
    products,
    setProducts,
    skip,
    setSkip,
    noMorePosts,
    setNoMorePosts,
    filtredProducts,
  ]);

  let main: React.ReactNode;
  if (loading) {
    main = (
      <Box
        display="flex"
        flexGrow={1}
        justifyContent="center"
        alignItems="center"
        pt="80px"
      >
        <CircularProgress />
      </Box>
    );
  } else if (filtredProducts.length) {
    main = (
      <Box pt="32px">
        <Container>
          <Grid container spacing={2}>
            {filtredProducts.map((product) => {
              const isInCart = !!productsInCart.find(
                ({ id }) => product.id === id
              );

              return (
                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <CardMedia>
                      <Box position="relative" width="100%">
                        <Box paddingTop="100%" />
                        <Image
                          src={product.image}
                          alt=""
                          fill
                          sizes={`(min-width: ${theme.breakpoints.values.lg}px) 25vw, (min-width: ${theme.breakpoints.values.md}px) 33.33vw, (min-width: ${theme.breakpoints.values.md}px) 50vw, 100vw`}
                        />
                      </Box>
                    </CardMedia>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" component="div" gutterBottom>
                        {...highlightSearchQuery(product.title)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {...highlightSearchQuery(product.description)}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "space-between" }}>
                      <Typography variant="h5" component="div">
                        ${product.price}
                      </Typography>
                      <Box>
                        <Button
                          variant="contained"
                          disabled={isInCart}
                          onClick={async () => {
                            if (database) {
                              const me = (
                                await database.collections.me.find().exec()
                              )[0];

                              await me.modify((doc) => {
                                doc.productsInCart = [
                                  ...doc.productsInCart,
                                  product.id,
                                ];
                                return doc;
                              });

                              setProductsInCart([...productsInCart, product]);
                            }
                          }}
                        >
                          {isInCart ? "Added to cart" : "Add to cart"}
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
    );
  } else {
    main = (
      <Box
        display="flex"
        flexGrow={1}
        justifyContent="center"
        alignItems="center"
        pt="80px"
        px="16px"
      >
        <Typography textAlign="center" variant="h3">Nothing found</Typography>
      </Box>
    );
  }

  const [cartOpen, setCartOpen] = useState(false);
  const [noCheckoutOpen, setNoCheckoutOpen] = useState(false);

  const cartButton = (
    <IconButton
      onClick={() => setCartOpen(true)}
      sx={{ position: "relative", color: "white" }}
    >
      <ShoppingCartIcon />
      {!!productsInCart.length && (
        <Box
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 8,
            height: 8,
            backgroundColor: "error.light",
            borderRadius: "50%",
          }}
        />
      )}
    </IconButton>
  );

  const cartDialog = (
    <Dialog
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Cart</DialogTitle>
      <DialogContent>
        {productsInCart.length ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productsInCart.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={product.image}
                        alt=""
                        width={100}
                        height={100}
                      />
                    </TableCell>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={async () => {
                          if (database) {
                            const me = (
                              await database.collections.me.find().exec()
                            )[0];

                            const productsInCart: ProductDocument[] =
                              await me.populate("productsInCart");

                            await me.modify((doc) => {
                              doc.productsInCart = doc.productsInCart.filter(
                                (id) => id !== product.id
                              );
                              return doc;
                            });

                            setProductsInCart(
                              productsInCart.filter(
                                ({ id }) => id !== product.id
                              )
                            );
                          }
                        }}
                      >
                        <RemoveCircleIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    $
                    {productsInCart.reduce((sum, product) => {
                      return sum + product.price;
                    }, 0)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box pt="32px" pb="32px">
            <Typography
              component="div"
              variant="h4"
              textAlign="center"
              color="text.secondary"
            >
              Cart is empty
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCartOpen(false)}>Close</Button>
        {!!productsInCart.length && (
          <Button
            onClick={() => {
              setCartOpen(false);
              setNoCheckoutOpen(true);
            }}
          >
            Checkout
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  const noCheckoutAlert = (
    <Dialog open={noCheckoutOpen} onClose={() => setNoCheckoutOpen(false)}>
      <DialogTitle>No Checkout</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This web application is designed for demonstration purposes and does
          not function as a genuine e-commerce store. As a result, it does not
          feature a checkout process.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setNoCheckoutOpen(false)} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}>
            <Typography variant="h6" noWrap component="div">
              SwiftBuy
            </Typography>
          </Box>
          <Search sx={{ marginRight: 4 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <SearchInput
              placeholder="Search…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </Search>
          {cartButton}
          {cartDialog}
          {noCheckoutAlert}
        </Toolbar>
      </AppBar>
      <Toolbar />
      {main}
      <Box
        ref={observerTarget}
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80px"
      >
        {loadingMorePosts && <CircularProgress />}
      </Box>
    </Box>
  );
}
