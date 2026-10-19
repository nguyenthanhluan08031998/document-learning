import type { ComponentType } from "react";
import deployCicdEc2 from "./deploy/cicd-ec2";
import deployDocker from "./deploy/docker";
import apiCompare from "./api/compare";
import apiGraphql from "./api/graphql";
import apiGrpc from "./api/grpc";
import apiRest from "./api/rest";
import concurrencyCompare from "./concurrency/compare";
import concurrencyDbLock from "./concurrency/db-lock";
import concurrencyDistributedLock from "./concurrency/distributed-lock";
import concurrencyOverview from "./concurrency/overview";
import designBehavioral from "./design/behavioral";
import designCheatSheet from "./design/cheat-sheet";
import designCleanArchitecture from "./design/clean-architecture";
import designCreational from "./design/creational";
import designMicroservice from "./design/microservice";
import designOop from "./design/oop";
import designPrinciples from "./design/principles";
import designStructural from "./design/structural";
import home from "./home";
import messagingCompare from "./messaging/compare";
import messagingKafka from "./messaging/kafka";
import messagingNats from "./messaging/nats";
import messagingRabbitmq from "./messaging/rabbitmq";
import operationsBuildLogger from "./operations/build-logger";
import operationsLogging from "./operations/logging";
import operationsObservability from "./operations/observability";
import operationsStructuredLogging from "./operations/structured-logging";

// Page body components keyed by "group/slug" ("home" for the overview)
export const PAGES: Record<string, ComponentType> = {
  "api/compare": apiCompare,
  "api/graphql": apiGraphql,
  "api/grpc": apiGrpc,
  "api/rest": apiRest,
  "concurrency/compare": concurrencyCompare,
  "concurrency/db-lock": concurrencyDbLock,
  "concurrency/distributed-lock": concurrencyDistributedLock,
  "concurrency/overview": concurrencyOverview,
  "design/behavioral": designBehavioral,
  "design/cheat-sheet": designCheatSheet,
  "design/clean-architecture": designCleanArchitecture,
  "design/creational": designCreational,
  "design/microservice": designMicroservice,
  "design/oop": designOop,
  "design/principles": designPrinciples,
  "design/structural": designStructural,
  "home": home,
  "messaging/compare": messagingCompare,
  "messaging/kafka": messagingKafka,
  "messaging/nats": messagingNats,
  "messaging/rabbitmq": messagingRabbitmq,
  "deploy/cicd-ec2": deployCicdEc2,
  "deploy/docker": deployDocker,
  "operations/build-logger": operationsBuildLogger,
  "operations/logging": operationsLogging,
  "operations/observability": operationsObservability,
  "operations/structured-logging": operationsStructuredLogging,
};
