import * as migration_20261127_140619_initial_schema from "./20261127_140619_initial_schema";
import * as migration_20261127_150000_demo_payment_method from "./20261127_150000_demo_payment_method";
import * as migration_20261127_151500_external_listing_fields from "./20261127_151500_external_listing_fields";
import * as migration_20261127_163000_marketplace_foundation from "./20261127_163000_marketplace_foundation";
import * as migration_20261127_180500_order_returns from "./20261127_180500_order_returns";

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
  {
    up: migration_20261127_151500_external_listing_fields.up,
    down: migration_20261127_151500_external_listing_fields.down,
    name: "20261127_151500_external_listing_fields",
  },
  {
    up: migration_20261127_163000_marketplace_foundation.up,
    down: migration_20261127_163000_marketplace_foundation.down,
    name: "20261127_163000_marketplace_foundation",
  },
  {
    up: migration_20261127_180500_order_returns.up,
    down: migration_20261127_180500_order_returns.down,
    name: "20261127_180500_order_returns",
  },
];
