---
order: 0
label: Migrating from a monolith
---

# Migrating from a monolithic application

Transforming an existing [monolithic application](https://en.wikipedia.org/wiki/Monolithic_application) into a distributed architecture is often more challenging than building a new federated application from scratch.

However, it's also a **bad idea** to **start** a new application **with a distributed architecture** since teams typically lack sufficient understanding of the business domain at that stage. Therefore, for most applications, it makes sense to **begin as monolithic application** and transition to a distributed architecture later.

With the introduction of [local modules](/reference/registration/registerLocalModules.md), Squide offers an alternative approach that lies between prior solutions. Instead of immediately embracing Team Topology's [stream-aligned teams](https://www.shortform.com/blog/stream-aligned-teams/) and striving for full team autonomy across the board, local modules allow teams to start with a [monorepo](https://en.wikipedia.org/wiki/Monorepo) setup and add independent local packages (modules) for each expected [value stream](https://en.wikipedia.org/wiki/Value_stream).

Since adding/deleting local packages in a monorepo setup is pretty cheap, teams can freely reorganize their value streams along the way and won't **preemptively invest into a distributed** CI/CD **infrastructure** as local modules are part of the host application build. With independent **but local** value streams, teams will be well-positioned to transition toward a federated application once they can justify the cost.

If your project is **already a monolithic application** with a [polyrepo setup](https://github.com/joelparkerhenderson/monorepo-vs-polyrepo#what-is-polyrepo) and you aim to migrate to a distributed architecture, we recommend a decoupling-first strategy using local modules and a monorepo setup.

## Decoupling first strategy

The primary challenge to migrate to a distributed architecture is coupling. Thus, for most applications, starting by decoupling the monolith into **composable value streams** could be the right strategy. It's a great way to get into the migration without the immediate need to update the CI/CD infrastructure or preemptively change developers' habits.

We recommend the following steps:

1. Transform the codebase into a monorepo setup.

2. Create independent local packages (modules) for each identified value stream.

3. Refactor the monolithic application code into the corresponding value stream local packages and ensure that each value stream [can be developed independently](develop-a-module-in-isolation.md) (e.g., without the need to start the entire application).

4. Import and [register the local packages](/reference/registration/registerLocalModules.md) (modules) into the host application.

5. Finally, transition from local modules to [remote modules](/reference/registration/registerRemoteModules.md) and update your CI/CD pipelines to enable independent deployment of modules.

By following these steps, you can gradually decouple your monolithic application, create modular value streams, and prepare the foundation for a distributed architecture.
