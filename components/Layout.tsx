import React from "react";
import Header from "./Heading";
import Footer from "./Footer";
import styles from "../pages/index.module.scss";
import cx from "classnames";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <article
        className={cx(
          styles.baseContainer,
          "h-screen w-full flex justify-center items-center"
        )}
      >
        <section
          className={cx(
            styles.containerBase,
            "h-screen w-full absolute top-0 z-0 opacity-50"
          )}
        ></section>

        <Container maxWidth="sm" className="w-full z-10">
          <Box
            component="form"
            className={cx(styles.containerBox, "p-2 rounded shadow-md w-full")}
          >
            {children}
          </Box>
        </Container>
      </article>
      <div className="absolute bottom-0 left-0 w-full">
        <Footer />
      </div>
    </>
  );
}
