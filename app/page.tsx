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
  Toolbar,
  Typography,
} from "@mui/material";
import { DatabaseContext, ProductDocument } from "@swift-buy/database";
import {
  Search,
  SearchIconWrapper,
  SearchInput,
} from "@swift-buy/ui-components";
import Image from "next/image";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { database } = useContext(DatabaseContext);
  const [products, setProducts] = useState<ProductDocument[]>([]);

  useEffect(() => {
    const fetchProcuts = async () => {
      if (database) {
        const products = await database.collections.products.find().exec();
        setProducts(products);
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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SwiftBuy
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <SearchInput
              placeholder="Search…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </Search>
        </Toolbar>
      </AppBar>
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
                    <Button variant="contained">Buy</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
}
