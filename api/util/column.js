exports.getColumns = () => {
  let product = [
    "product_id",
    "product_title",
    "product_alias",
    "product_type",
    "product_sku",
    "local_sku",
    "manufacturer_sku",
    "manufacturer_id",
    "product_features",
    "product_introtext",
    "product_description",
    "product_active",
    "product_ordering",
    "metakey",
    "metadesc",
    "primary_video_url",
    "tags",
    "owner_uid",
    "language",
    "listing_purchased",
    "listing_start",
    "category",
    "category_ext",
    "length",
    "width",
    "height",
    "weight",
    "vol_weight",
    "shipping_length",
    "shipping_width",
    "shipping_height",
    "shipping_weight",
    "whats_in_box",
  ];

  let mfr = [
    "manufacturer_name",
    "manufacturer_company",
    "manufacturer_catid",
    "manufacturer_code",
  ];

  let seller = [
    "psx_id",
    "seller_uid",
    "seller_sku",
    "is_selling",
    "pricing_type",
    "quantity_min",
    "quantity_max",
    "disable_stock",
    "stock",
    "over_stock",
    "stock_reserved",
    "stock_sold",
    "seller_name",
    "seller_username",
    "seller_email",
    "seller_block",
    "seller_company",
    "seller_catid",
    "seller_code",
    "seller_store",
    "store_address",
    "seller_commission",
    "seller_active",
    "seller_mobile",
    "seller_website",
    "seller_currency",
    "forex_rate",
    "listing_type",
    "item_condition",
    "flat_shipping",
    "shipping_flat_fee",
    "return_days",
    "return_tnc",
    "exchange_days",
    "exchange_tnc",
    "whats_in_box",
    "delivery_mode",
    "download_limit",
    "download_period",
    "preview_mode",
    "preview_url",
    "listing_active",
    "listing_purchased",
    "listing_start",
    "listing_end",
    "spl_category",
    "seller_gl_id",
    "store_lat",
    "store_lng",
    "product_lat",
    "product_lng",
    "psx_country",
    "psx_state",
    "psx_district",
    "psx_city",
    "psx_locality",
    "psx_sublocality",
    "psx_zip",
    "store_country",
    "store_state",
    "store_district",
    "store_city",
    "store_locality",
    "store_sublocality",
    "store_zip",
  ];

  let variant = [
    "variant_id",
    "variant_title",
    "variant_alias",
    "variant_sku",
    "variant_description",
    "variant_features",
    "variant_active",
  ];

  let vsx = [
    "vsx_id",
    "variant_price_mod",
    "variant_price_mod_perc",
    "stock",
    "over_stock",
    "stock_reserved",
    "stock_sold",
    "is_selling_variant",
  ];

  let ext = [
    "code",
    "seller_count",
    "variant_count",
    "stock_capacity",
    "specifications",
    "product_rating",
    "order_count",
    "order_units",
    "is_visible",
    "related_products",
    "listings_by_type",
    "no_stock",
    "product_uid",
  ];

  let price = [
    "product_price",
    "variant_price",
    "list_price",
    "basic_price",
    "sales_price",
    "advance_prices",
    "sales_price_fx",
  ];
  [...product, ...mfr, ...seller, ...variant, ...vsx, ...ext, ...price].forEach(
    (key) => {
      columns[key] = "";
    }
  );
  return columns;
};
