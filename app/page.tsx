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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { database } = useContext(DatabaseContext);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductDocument[]>([]);
  const [productsInCart, setProductsInCart] = useState<ProductDocument[]>([]);

  useEffect(() => {
    const fetchProcuts = async () => {
      if (database) {
        const products = await database.collections.products.find().exec();
        setProducts(products);
        setLoading(false);
      }
    };

    fetchProcuts();
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
            {filtredProducts.map((product) => (
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
                    <Button
                      variant="contained"
                      onClick={() => {
                        setProductsInCart([...productsInCart, product]);
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
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

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static">
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
          <IconButton sx={{ position: "relative", color: "white" }}>
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
        </Toolbar>
      </AppBar>
      {main}
    </Box>
  );
}
