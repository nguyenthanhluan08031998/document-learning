import type { ComponentType } from "react";
import dbCompare from "./db/compare";
import dbDynamodb from "./db/dynamodb";
import dbMongodb from "./db/mongodb";
import dbMysql from "./db/mysql";
import dbPostgresql from "./db/postgresql";
import deployCicdEc2 from "./deploy/cicd-ec2";
import deployDocker from "./deploy/docker";
import jsAsync from "./js/async";
import jsCore from "./js/core";
import jsToolbox from "./js/toolbox";
import jsTypescript from "./js/typescript";
import fe from "./fe";
import git from "./git";
import gitMergeRebase from "./git/merge-rebase";
import gitWorkflow from "./git/workflow";
import aiRag from "./ai/rag";
import golangBasics from "./golang/basics";
import golangErrors from "./golang/errors";
import golangHttpDb from "./golang/http-db";
import golangSyncPatterns from "./golang/sync-patterns";
import golangConcurrency from "./golang/concurrency";
import golangDataStructures from "./golang/data-structures";
import golangInterview from "./golang/interview";
import golangMemory from "./golang/memory";
import golangProduction from "./golang/production";
import golangRuntime from "./golang/runtime";
import golangVersions from "./golang/versions";
import golangVsNodejs from "./golang/vs-nodejs";
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
import designEdge from "./design/edge";
import designSso from "./design/sso";
import be from "./be";
import messagingCompare from "./messaging/compare";
import messagingKafka from "./messaging/kafka";
import messagingNats from "./messaging/nats";
import messagingRabbitmq from "./messaging/rabbitmq";
import messagingSqs from "./messaging/sqs";
import operationsBuildLogger from "./operations/build-logger";
import operationsLogging from "./operations/logging";
import operationsObservability from "./operations/observability";
import operationsStructuredLogging from "./operations/structured-logging";

// Page body components keyed by "group/slug", plus "<area>" for an area overview
export const PAGES: Record<string, ComponentType> = {
  "ai/rag": aiRag,
  "golang/basics": golangBasics,
  "golang/errors": golangErrors,
  "golang/http-db": golangHttpDb,
  "golang/sync-patterns": golangSyncPatterns,
  "golang/concurrency": golangConcurrency,
  "golang/data-structures": golangDataStructures,
  "golang/interview": golangInterview,
  "golang/memory": golangMemory,
  "golang/production": golangProduction,
  "golang/runtime": golangRuntime,
  "golang/versions": golangVersions,
  "golang/vs-nodejs": golangVsNodejs,
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
  "design/edge": designEdge,
  "design/sso": designSso,
  "be": be,
  "messaging/compare": messagingCompare,
  "messaging/kafka": messagingKafka,
  "messaging/nats": messagingNats,
  "messaging/rabbitmq": messagingRabbitmq,
  "messaging/sqs": messagingSqs,
  "db/compare": dbCompare,
  "db/dynamodb": dbDynamodb,
  "db/mongodb": dbMongodb,
  "db/mysql": dbMysql,
  "db/postgresql": dbPostgresql,
  "deploy/cicd-ec2": deployCicdEc2,
  "deploy/docker": deployDocker,
  "js/async": jsAsync,
  "js/core": jsCore,
  "js/toolbox": jsToolbox,
  "js/typescript": jsTypescript,
  "fe": fe,
  "git": git,
  "git/merge-rebase": gitMergeRebase,
  "git/workflow": gitWorkflow,
  "operations/build-logger": operationsBuildLogger,
  "operations/logging": operationsLogging,
  "operations/observability": operationsObservability,
  "operations/structured-logging": operationsStructuredLogging,
};
