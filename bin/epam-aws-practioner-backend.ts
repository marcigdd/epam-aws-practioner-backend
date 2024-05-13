#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "../lib/product-service-stack";
import { ImportServiceStack } from "../lib/import-service-stack";
import { AuthorizationServiceStack } from "../lib/authorization-service-stack";

const app = new cdk.App();
const authorizationServiceStack = new AuthorizationServiceStack(
  app,
  "AuthorizationServiceStack",
  {}
);
const productServiceStack = new ProductServiceStack(
  app,
  "ProductServiceConstruct",
  {}
);
const importServiceStack = new ImportServiceStack(
  app,
  "ImportServiceStack",
  {}
);
importServiceStack.addDependency(productServiceStack);
importServiceStack.addDependency(authorizationServiceStack);
