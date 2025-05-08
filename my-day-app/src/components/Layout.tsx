import Head from "next/head";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({children}: any) {
  return (
    <>
      <Head>
        <title>MY-PJ-DAY</title>
        <meta
          name="description"
          content="Next.js + Firebase로 만든 개인 프로젝트입니다."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
