# Job-Fire Monorepo

**Job-Fire** is a monorepo that provides a flexible job scheduling system with support for various database adapters. The core library offers general scheduling functionality, while specific adapters for databases like Redis and MongoDB are available as separate packages. This modular design lets users select only the database dependencies they need.

## Overview

-   **Core Package** (`job-fire`): Provides the foundational scheduling functions of the Job-Fire system.
-   **Redis Adapter** (`job-fire.redis`): Adds Redis support for `job-fire`.
-   **MongoDB Adapter** (`job-fire.mongo`): Adds MongoDB support for `job-fire`.

## ⚙️ Installation

Install the core package along with only the adapters you need.

```bash
# Install core package
npm install job-fire

# Optional: install Redis adapter
npm install job-fire.redis

# Optional: install MongoDB adapter
npm install job-fire.mongo
```

## 🚀 Usage

Here’s a quick example of how to use the core package together with the Redis adapter:

```typescript
import { Scheduler } from "job-fire";
import { RedisAdapter } from "job-fire.redis";
const store = new RedisStore();

const scheduler = new Scheduler({ adapter: store });
scheduler.addJob(
    "myJob",
    () => {
        console.log("Job is running!");
    },
    { interval: 1000 }
);
```

## 🧪 Examples

Explore more examples in the [examples](./packages/core/examples) folder.

## 📖 Package Documentation

### Core Package (`job-fire`)

The core package provides the essential functionality of the Job-Fire system.

**Features**

-   `Scheduler`: The main scheduler class for managing jobs.
-   `Job`: Represents a scheduled job with defined actions.

### Redis Adapter (`job-fire.redis`)

The Redis adapter enables Redis as the storage engine for the Job-Fire system.
**Features**

-   `RedisAdapter`: Implements connection and operations for Redis.

### MongoDB Adapter (`job-fire.mongo`)

The MongoDB adapter enables MongoDB as the storage engine for the Job-Fire system.
**Features**

-   MongoAdapter: Implements connection and operations for MongoDB.

## 🤝 Contributing

Contributions are welcome! Please check out the [CONTRIBUTING.md](/CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](/CODE_OF_CONDUCT.md) for details.

## 📜 License

This project is licensed under the [MIT License](./LICENSE).
