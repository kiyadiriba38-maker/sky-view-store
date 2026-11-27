import * as migration_20261127_140619_initial_schema from "./20261127_140619_initial_schema";
import * as migration_20261127_150000_demo_payment_method from "./20261127_150000_demo_payment_method";

export const migrations = [
  {
    up: migration_20261127_140619_initial_schema.up,
    down: migration_20261127_140619_initial_schema.down,
    name: "20261127_140619_initial_schema",
  },
  {
    up: migration_20261127_150000_demo_payment_method.up,
    down: migration_20261127_150000_demo_payment_method.down,
    name: "20261127_150000_demo_payment_method",
  },
];
