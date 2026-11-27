import * as migration_20261127_140619_initial_schema from "./20261127_140619_initial_schema";
import * as migration_20261127_150000_demo_payment_method from "./20261127_150000_demo_payment_method";
import * as migration_20261127_151500_external_listing_fields from "./20261127_151500_external_listing_fields";
import * as migration_20261127_163000_marketplace_foundation from "./20261127_163000_marketplace_foundation";
import * as migration_20261127_180500_order_returns from "./20261127_180500_order_returns";
import * as migration_20261127_183000_listing_policy_review from "./20261127_183000_listing_policy_review";
import * as migration_20261127_184000_product_seller_relation from "./20261127_184000_product_seller_relation";
import * as migration_20261127_191500_notifications from "./20261127_191500_notifications";
import * as migration_20261127_193500_reports from "./20261127_193500_reports";

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
  {
    up: migration_20261127_183000_listing_policy_review.up,
    down: migration_20261127_183000_listing_policy_review.down,
    name: "20261127_183000_listing_policy_review",
  },
  {
    up: migration_20261127_184000_product_seller_relation.up,
    down: migration_20261127_184000_product_seller_relation.down,
    name: "20261127_184000_product_seller_relation",
  },
  {
    up: migration_20261127_191500_notifications.up,
    down: migration_20261127_191500_notifications.down,
    name: "20261127_191500_notifications",
  },
  {
    up: migration_20261127_193500_reports.up,
    down: migration_20261127_193500_reports.down,
    name: "20261127_193500_reports",
  },
];
