#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductServiceConstruct } from "../lib/product-service-stack";
import { ImportServiceStack } from "../lib/import-service-stack";

const app = new cdk.App();
new ProductServiceConstruct(app, "ProductServiceConstruct", {});
new ImportServiceStack(app, "ImportServiceStack", {});