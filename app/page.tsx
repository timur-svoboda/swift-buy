"use client";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Typography,
  CardMedia,
} from "@mui/material";
import { DatabaseContext, ProductDocument } from "@swift-buy/database";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
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

  return (
    <Box pt="32px" pb="32px">
      <Container>
        <Grid container spacing={2}>
          {products.map((product) => (
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
                    {product.title}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {product.description}
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
  );
}
