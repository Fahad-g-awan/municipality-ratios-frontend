"use client";

import { ApolloClient, InMemoryCache, ApolloProvider, from } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import React from "react";

const Provider = ({ children }: { children: React.ReactNode }) => {
  const authLink = setContext((_, { headers }) => {
    const user = JSON.parse(localStorage.getItem("CURRENT_USER")!);
    const accessToken = user ? `Bearer ${user.accessToken.token}` : "";
    return {
      headers: {
        ...headers,
        authorization: accessToken,
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
      });
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  });

  const apolloClient = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
    link: from([
      authLink,
      errorLink,
      createUploadLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
        credentials: "same-origin",
      }),
    ]),
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};

export default Provider;
