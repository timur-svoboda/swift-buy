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
} from "@mui/material";
import { DatabaseContext, ProductDocument } from "@swift-buy/database";
import {
  Search,
  SearchIconWrapper,
  SearchInput,
} from "@swift-buy/ui-components";
import Image from "next/image";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { database } = useContext(DatabaseContext);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductDocument[]>([]);
  const [productsInCart, setProductsInCart] = useState<ProductDocument[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (database) {
        const products = await database.collections.products.find().exec();
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
  }, [database]);

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

  let main: React.ReactNode;
  if (loading) {
    main = (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  } else if (filtredProducts.length) {
    main = (
      <Box pt="32px" pb="32px">
        <Container>
          <Grid container spacing={2}>
            {filtredProducts.map((product) => {
              const isInCart = !!productsInCart.find(
                ({ id }) => product.id === id
              );

              return (
                <Grid item key={product.id} xs={3}>
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
                        <Image src={product.image} alt="" fill sizes="25vw" />
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
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h2">Nothing found</Typography>
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
          <Button onClick={() => {
            setCartOpen(false);
            setNoCheckoutOpen(true);
          }}>Checkout</Button>
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SwiftBuy
          </Typography>
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
    </Box>
  );
}
