
const connection = require('../util/dbcon')
const config = require('../util/config')
//import column names
let columns = require('../util/column')

  getProductData = (product_id) =>{
      return new Promise((_resolve,_reject)=>{
        let product = {};
        let sellers = {};
        let variants = {};
        let prices = {};
        //this will contain the final data in JSON to be sent to cache store
        let items = {};   
       loadProduct()
       {
           //fetch this information from php file
           let allowed       = config['allowed_product_type'];
           let allow_package = config['allowed_product_package'];
           let multi_seller  = config['multi_seller'][0];
   
            
           columns['product_id']          = 'a.id'
           columns['product_title']       = 'a.title'
           columns['product_alias']       = 'a.alias'
           columns['product_type']        = 'a.type'
           columns['local_sku']           = 'a.local_sku'
           columns['manufacturer_sku']    = 'a.manufacturer_sku'
           columns['manufacturer_id']     = 'a.manufacturer_id'
           columns['product_features']    = 'a.features'
           columns['product_introtext']   = 'a.introtext'
           columns['product_description'] = 'a.description'
           columns['product_active']      = 'a.state'
           columns['product_ordering']    = 'a.ordering'
           columns['metakey']             = 'a.metakey'
           columns['metadesc']            = 'a.metadesc'
           columns['primary_video_url']   = 'a.primary_video_url'
           columns['tags']                = 'a.tags'
           columns['owner_uid']          = 'a.owned_by'
           columns['language']            = 'a.language'
           columns['listing_purchased']   = 'a.created'
           columns['listing_start']       = 'a.created'
   
           if (!multi_seller)
           {
               columns['product_sku'] = 'a.local_sku';
           }
   
        allowed = allowed === 'both' ? ['physical', 'electronic'] : [allowed];
   
           if (allow_package)
           {
               allowed = ['package'];
           }
           
        //    $query = $this->db->getQuery(true);   

           let query = 'select ';
           for (const col in columns) {
               if (columns.hasOwnProperty((col))) {
                  query += `${col} as ${column[col]}, `;
               }
           }
           query = query.slice(0,query.lastIndexOf(","))
           query+= ` FROM #__sellacious_products as a WHERE (a.state = 0 OR a.state = 1) AND a.id = ${product_id} AND (a.type = '${allowed}')`
           connection.query(query,(_err,rows)=>{
               rows.forEach(async (row)=>{
                   if(row && row.manufacturer_id){
                       row.product_features = JSON.parse(row.product_features)
                       if(row.manufacturer_id){
                           let user = await getManufacturer(row.manufacturer_id)
                           if(user){
                            row.manufacturer_name    = user.name;
                            row.manufacturer_company = user.m_company;
                            row.manufacturer_catid   = user.m_catid;
                            row.manufacturer_code    = user.m_code;
                           }
                       }
                   }
               })
           })

           product['products'] = rows;//array of objects
       }
   
       /**
        * Method to load the list of sellers for the active product
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       loadSellerList()
       {
           let multiSeller = config['multi_seller'];           
           columns['psx_id']       = 'psx.id';
           columns['seller_uid']      = 'psx.seller_uid';
           columns['seller_sku']       = 'psx.seller_sku';
           columns['is_selling']        = 'psx.state';
           columns['pricing_type']      = 'psx.pricing_type';
           columns['quantity_min']      = 'psx.quantity_min';
           columns['quantity_max' ]     = 'psx.quantity_max';
           columns['disable_stock' ]    = 'psx.disable_stock';
           columns['stock'         ]    = 'psx.stock';
           columns['over_stock'    ]    = 'psx.over_stock';
           columns['stock_reserved']    = 'psx.stock_reserved';
           columns['stock_sold'     ]   = 'psx.stock_sold';
           columns['product_location']  = 'psx.product_location';
           columns['psx_country'      ] = 'psx.loc_country';
           columns['psx_state'       ]  = 'psx.loc_state';
           columns['psx_district'    ]  = 'psx.loc_district';
           columns['psx_city'        ]  = 'psx.loc_city';
           columns['psx_locality'    ]  = 'psx.loc_locality';
           columns['psx_sublocality' ]  = 'psx.loc_sublocality';
           columns['psx_zip'        ]   = 'psx.loc_zip';
           columns['seller_name'    ]   = 'u.name';
           columns['seller_username']   = 'u.username';
           columns['seller_email'  ]    = 'u.email';
           columns['seller_block'  ]    = 'u.block';
           columns['seller_company']    = 's.title';
           columns['seller_catid'  ]    = 's.category_id';
           columns['seller_code'   ]    = 's.code';
           columns['seller_store'  ]    = 's.store_name';
           columns['store_address' ]    = 's.store_address';
           columns['store_location' ]   = 's.store_location';
           columns['store_country'  ]   = 's.loc_country';
           columns['store_state'   ]    = 's.loc_state';
           columns['store_district' ]   = 's.loc_district';
           columns['store_city'    ]    = 's.loc_city';
           columns['store_locality' ]   = 's.loc_locality';
           columns['store_sublocality'] = 's.loc_sublocality';
           columns['store_zip'       ]  = 's.loc_zip';
           columns['seller_commission'] = 's.commission';
           columns['seller_active'  ]   = 's.state';
           columns['seller_mobile' ]    = 'p.mobile';
           columns['seller_website' ]   = 'p.website';
   
           if (multiSeller)
           {
               columns['product_sku'] = 'psx.seller_sku';
           }
           let query = 'select ';
           for (const col in columns) {
               if (columns.hasOwnProperty((col))) {
                  query += `${col} as ${colimns[col]}, `;
               }
           }
           query = query.slice(0,query.lastIndexOf(","))
           query+= ` FROM #__sellacious_product_sellers as psx WHERE psx.product_id = ${product_id}`
           if (!$multiSeller)
           {
               let default_seller = config['default_seller'];
               query+= ` and (psx.seller_uid = ${parseInt(default_seller)} OR COALESCE(psx.seller_uid, 0) = 0)`
           }
           query+=`INNER JOIN #__users as u ON u.id = psx.seller_uid LEFT JOIN #__sellacious_sellers as s ON s.user_id = u.id LEFT JOIN #__sellacious_profiles as p ON p.user_id = u.id`
   
           connection.query(query,(err,rows)=>{
            if(err){console.log(err)}   
            else if(rows.length === 0){
                rows =[]
            }
            else{
                product["seller_count"] = rows.length
   
                let g_currency = config.currency.getGlobal('code_3');//need to check
   
           rows.foreach((item)=>{
               let uid = parseInt(item.seller_uid);
   
               item.seller_active  = item.seller_active && !item.seller_block;
               item.seller_currency = config.currency.forSeller(uid, 'code_3');//need to check 
               // If no filter, add root node
               let locations = {'all' : $config.seller.getShipLocations($uid) || 1};
   
               item.seller_gl_id = locations;
   
               try
               {
                   item.forex_rate = config.currency.getRate(item.seller_currency, g_currency);//need to check
               }
               catch(err)
               {
                   item.forex_rate = null;
               }
   
               sellers[uid] = item;
           })
           }})
       }
   
       /**
        * Method to load the list of variants for the active product
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       loadVariantList()
       {
           if (config['multi_variant'])
           {
                 
            columns['variant_id']          = 'v.id';
            columns['variant_title']       = 'v.title';
            columns['variant_alias' ]      = 'v.alias';
            columns['variant_sku'   ]      = 'v.local_sku';
            columns['variant_description'] = 'v.description';
            columns['variant_features']    = 'v.features';
            columns['variant_active']      = 'v.state';

            let query = 'select ';
            for (const col in columns) {
               if (columns.hasOwnProperty((col))) {
                  query += `${col} as ${colimns[col]}, `;
               }
            }
            query = query.slice(0,query.lastIndexOf(","))
            query+= ` from #__sellacious_variants as v where v.product_id = ${parseInt(product_id)}`

            connection.query(query,(err,Variants)=>{
                if(err){
                    console.log('Erro on receiving variants')
                }
                else{
                    Variants.forEach((variant)=>{
                        variant.variant_features = JSON.parse(variant.variant_features)
                    })
                    variants = Variants
                    product['variant_count'] = variants.length
                }
            })
           }
       }
   
       /**
        * Method to load the list of categories for the active product
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       loadCategories()//ask Sir
       {
        //    let filter  = {
        //        'list.select' : 'a.id, a.title',
        //        'list.join'   : [
        //            ['inner', '#__sellacious_product_categories as pc ON a.id = pc.category_id'],
        //        ],
        //        'list.where'  : `pc.product_id = ${parseInt(productId)}`,
        //        'state'       : 1,
        //        };
           records = $this->helper->category->loadObjectList($filter) ?: array();
           $records = ArrayHelper::getColumn($records, 'title', 'id');
   
           if ($records)
           {
               $aks = $this->helper->category->getParents(array_keys($records), true, array('state' => 1));
               $aks = $this->helper->category->loadObjectList(array('list.select' => 'a.id, a.title', 'id' => $aks));
   
               $values = ArrayHelper::getColumn($aks, 'title', 'id');
   
               $this->product->category     = $records;
               $this->product->category_ext = $values;
           }
       }
   
       /**
        * Method to load the product type specific attributes for the active product
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       loadTypeAttributes()
       {
           if (product.product_type === 'physical')
           {
               let query = `Select length, width, height, weight, vol_weight from #__sellacious_product_physical where product_id = ${parseInt(product_id)}`; 
                connection.query(query,(err,attribs)=>{
                    if(err){
                        console.log(err)
                    }else{
                        attribs.forEach((attrib)=>{
                            for (const key in attrib) {
                                if (object.hasOwnProperty(key)) {
                                     product[key] = attrib[key]
                                }
                            }
                        })
                    }
                })
           }
       }
   
       /**
        * Method to load the product type specific attributes for the active product for each seller
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       loadTypeAttributesSeller()
       {
           let query = 'SELECT ';
   
           if (product.product_type === 'electronic')
           {
            //    $query->select('delivery_mode, download_limit, download_period, preview_mode, preview_url');
               query+= "delivery_mode, download_limit, download_period, preview_mode, preview_url from #__sellacious_eproduct_sellers"
            //    $query->from($this->db->quoteName('#__sellacious_eproduct_sellers'));
           }
           else if (product.product_type === 'physical')
           {
            //    $query->select('listing_type, item_condition, flat_shipping, shipping_flat_fee, return_days, return_tnc, exchange_days, exchange_tnc, whats_in_box');
               query+="listing_type, item_condition, flat_shipping, shipping_flat_fee, return_days, return_tnc, exchange_days, exchange_tnc, whats_in_box, length as shipping_length, width as shipping_width, height as shipping_height, weight as shipping_weight FROM #__sellacious_physical_sellers "
            //    $query->select('length as shipping_length, width as shipping_width, height as shipping_height, weight as shipping_weight');
            //    $query->from($this->db->quoteName('#__sellacious_physical_sellers'));
           }
           else if (product.product_type === 'package')
           {
            //    $query->select('listing_type, item_condition, flat_shipping, shipping_flat_fee, return_days, return_tnc, exchange_days, exchange_tnc, whats_in_box');
            //    $query->select('length as shipping_length, width as shipping_width, height as shipping_height, weight as shipping_weight');
               query+="listing_type, item_condition, flat_shipping, shipping_flat_fee, return_days, return_tnc, exchange_days, exchange_tnc, whats_in_box, length as shipping_length, width as shipping_width, height as shipping_height, weight as shipping_weight FROM #__sellacious_package_sellers"
            //    $query->from($this->db->quoteName('#__sellacious_package_sellers'));
           }
           else
           {
               return;
           }
   
           for (const sKey in sellers) {
               if (object.hasOwnProperty(sKey)) {
                   query+= `where psx_id = ${parseInt(seller.psx_id)}`
                   connection.query(query,(err,attribs)=>{
                       for (const key in attribs) {
                           if (object.hasOwnProperty(key)) {
                               sellers[key]=JSON.parse(attribs[key])
                           }
                       }
                   })
               }
           }
           foreach (sellers as $sKey => $seller)
           {
               $query->clear(('where'))->where('psx_id = ' . (int) $seller->psx_id);
   
               $attribs = $this->db->setQuery($query)->loadAssoc() ?: array();
   
               foreach ($attribs as $key => $value)
               {
                   $cpx = array('shipping_length', 'shipping_width', 'shipping_height', 'shipping_weight');
   
                   if (in_array($key, $cpx))
                   {
                       $this->sellers[$sKey]->$key = @json_decode($value) ?: null;
                   }
                   else
                   {
                       $this->sellers[$sKey]->$key = $value;
                   }
               }
           }
       }
   
       /**
        * Method to load the listing attributes for the active product and each of its sellers
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       loadListing()
       {
           let free =config['free_listing'];
   
           if (free)
           {
               let date = now Date()
                
               foreach ($this->sellers as $seller)
               {
                   $seller->listing_active = 1;
                   $seller->listing_end    = $date->format('Y-12-31 23:59:59');
               }
           }
           else
           {
               $query  = $this->db->getQuery(true);
               $now    = JFactory::getDate()->toSql();
               $nullDt = $this->db->getNullDate();
   
               $cols = array();
   
               $cols['listing_active']    = 'l.state';
               $cols['listing_purchased'] = 'l.subscription_date';
               $cols['listing_start']     = 'l.publish_up';
               $cols['listing_end']       = 'l.publish_down';
   
               foreach ($this->sellers as $seller)
               {
                   $cond = array(
                       'l.product_id = ' . (int) $this->productId,
                       'l.seller_uid = ' . (int) $seller->seller_uid,
                       'l.publish_up != ' . $this->db->q($nullDt),
                       'l.publish_down != ' . $this->db->q($nullDt),
                       'l.publish_up <= ' . $this->db->q($now),
                       'l.publish_down > ' . $this->db->q($now),
                       'l.category_id = 0',
                       'l.state = 1',
                   );
   
                   $query->select($this->db->quoteName(array_values($cols), array_keys($cols)))
                         ->from($this->db->quoteName('#__sellacious_seller_listing', 'l'))
                         ->where($cond);
   
                   $listing = $this->db->setQuery($query)->loadObject();
   
                   if ($listing)
                   {
                       $seller->listing_active    = $listing->listing_active;
                       $seller->listing_purchased = $listing->listing_purchased;
                       $seller->listing_start     = $listing->listing_start;
                       $seller->listing_end       = $listing->listing_end;
                   }
                   else
                   {
                       $seller->listing_active    = 0;
                       $seller->listing_purchased = null;
                       $seller->listing_start     = null;
                       $seller->listing_end       = null;
                   }
               }
           }
       }
   
       /**
        * Method to load the special categories associated with the active product and each of its sellers
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       protected function loadSpecialCategories()
       {
           $nullDt = $this->db->getNullDate();
           $now    = JFactory::getDate()->toSql();
   
           $conditions = array(
               'l.category_id = c.id',
               'l.category_id > 0',
               'l.publish_up != ' . $this->db->q($nullDt),
               'l.publish_down != ' . $this->db->q($nullDt),
               'l.publish_up <= ' . $this->db->q($now),
               'l.publish_down > ' . $this->db->q($now),
               'l.state = 1',
           );
   
           foreach ($this->sellers as $seller)
           {
               $query = $this->db->getQuery(true);
   
               $query->select('c.id, c.title')
                     ->from($this->db->quoteName('#__sellacious_splcategories', 'c'))
                     ->order('c.lft');
   
               $query->join('inner', $this->db->quoteName('#__sellacious_seller_listing', 'l') . ' ON ' . implode(' AND ', $conditions))
                     ->where('l.seller_uid = ' . (int) $seller->seller_uid)
                     ->where('l.product_id = ' . (int) $this->productId);
   
               $records = $this->db->setQuery($query)->loadObjectList() ?: array();
   
               if ($records)
               {
                   $values = ArrayHelper::getColumn($records, 'title', 'id');
   
                   $seller->spl_category = $values;
               }
           }
       }
   
       /**
        * Process the records for caching
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       protected function batchProcess()
       {
           foreach ($this->sellers as $seller)
           {
               list($latP, $lngP) = explode(',', $seller->product_location . ',');
               list($latS, $lngS) = explode(',', $seller->store_location . ',');
   
               unset($seller->product_location, $seller->store_location);
   
               $registry = new Registry;
   
               $registry->loadObject($this->product);
               $registry->loadObject($seller);
   
               $registry->set('store_lat', $latS);
               $registry->set('store_lng', $lngS);
               $registry->set('product_lat', ($latP || $lngP) ? $latP : $latS);
               $registry->set('product_lng', ($latP || $lngP) ? $lngP : $lngS);
   
               if (!$seller->psx_country && !$seller->psx_state && !$seller->psx_district &&
                   !$seller->psx_city && !$seller->psx_locality && !$seller->psx_sublocality && !$seller->psx_zip)
               {
                   $registry->set('psx_country', $seller->store_country);
                   $registry->set('psx_state', $seller->store_state);
                   $registry->set('psx_district', $seller->store_district);
                   $registry->set('psx_city', $seller->store_city);
                   $registry->set('psx_locality', $seller->store_locality);
                   $registry->set('psx_sublocality', $seller->store_sublocality);
                   $registry->set('psx_zip', $seller->store_zip);
               }
   
               $related = $this->helper->relatedProduct->getByProduct($this->productId);
   
               $registry->set('related_products', $related);
   
               $specP = $this->getSpecifications(0);
   
               $itemR = $this->makeRecord($registry, $seller, $specP);
   
               $this->append($itemR);
   
               foreach ($this->variants as $variant)
               {
                   $vsx = $this->getVsx($variant->variant_id, $seller->seller_uid);
   
                   if ($vsx)
                   {
                       $itemR = $this->makeRecord($registry, $seller, $specP, $variant, $vsx);
   
                       $this->append($itemR);
                   }
               }
           }
   
           $this->addPrices();
   
           EventHelper::trigger('onProcessCacheRecord', array('context' => 'com_sellacious.product', 'items' => &$this->items));
   
           $this->checkListable();
   
           foreach ($this->items as $item)
           {
               $item->set('listings_by_type', $this->getListingsByType());
           }
       }
   
       /**
        * Method to populate variant level record from base product record
        *
        * @param   Registry  $registry  The base record object with just the common values for all variants
        * @param   stdClass  $seller    The seller + psx record, @see  loadSellerList()
        * @param   array     $specP     The main product specifications, @see   getSpecifications()
        * @param   stdClass  $variant   The variant record, @see  loadVariantList()
        * @param   stdClass  $vsx       The variant-seller attributes, @see   getVsx()
        *
        * @return  Registry
        *
        * @since   __DEPLOY_VERSION__
        */
       protected function makeRecord(Registry $registry, $seller, $specP, $variant = null, $vsx = null)
       {
           $regR = new Registry((string) $registry);
   
           $regR->loadObject($variant);
           $regR->loadObject($vsx);
   
           $allowRate = $this->helper->config->get('product_rating');
           $variantId = $variant ? $variant->variant_id : 0;
           $sellerUid = $seller->seller_uid;
   
           $code       = $this->helper->product->getCode($this->productId, $variantId, $sellerUid);
           $spec       = $variantId ? $this->getSpecifications($variantId) : array();
           $orderCount = $this->helper->order->getOrderCount($this->productId, $variantId, $sellerUid);
           $orderUnits = $this->helper->order->getOrderCount($this->productId, $variantId, $sellerUid, true);
           $rating     = $allowRate ? $this->helper->rating->getProductRating($this->productId, $variantId, $sellerUid) : '';
   
           $regR->set('code', $code);
           $regR->set('variant_id', $variantId);
           $regR->set('specifications', array_merge($specP, $spec));
           $regR->set('stock_capacity', $regR->get('stock') + $regR->get('over_stock'));
           $regR->set('product_rating', $allowRate ? $rating : null);
           $regR->set('order_count', $orderCount);
           $regR->set('order_units', $orderUnits);
           $regR->set('sales_price_fx', $regR->get('sales_price') * $regR->get('forex_rate'));
           $regR->set('no_stock', $regR->get('stock_capacity') <= 0);
           $regR->set('product_uid', $regR->get('seller_count') > 1 ? $code : $this->productId);
   
           return $regR;
       }
   
       /**
        * Method to get items by listing type
        *
        * @return  stdClass[]
        *
        * @since   __DEPLOY_VERSION__
        */
       public function getListingsByType()
       {
           static $listings;
   
           if (isset($listings[$this->productId]) && is_array($listings[$this->productId]))
           {
               return $listings[$this->productId];
           }
   
           $productType  = $this->product->product_type;
           $showListing  = $this->helper->config->get('show_listing_type');
           $listingTypes = (array) $this->helper->config->get('allowed_listing_type');
           $conditionbox = ($showListing && (count($listingTypes) > 1));
   
           if ($productType == 'electronic' || !$conditionbox)
           {
               return $listings[$this->productId] = array();
           }
   
           $results = array();
   
           foreach ($this->items as $item)
           {
               $listingType = $item->get('listing_type', 1);
   
               if (!in_array($listingType, $listingTypes) || !$item->get('is_selling'))
               {
                   continue;
               }
   
               if (!isset($results[$listingType]))
               {
                   $results[$listingType] = array(
                       'listing_type' => $listingType,
                       'count'        => 0,
                       'from_price'   => 0.00,
                       'items'        => array()
                   );
               }
   
               $results[$listingType]['item_uids'][] = $item->get('code');
   
               if ($item->get('variant_id') > 0)
               {
                   continue;
               }
   
               $results[$listingType]['count'] += 1;
   
               $fromPrice  = $results[$listingType]['from_price'];
               $salesPrice = $item->get('sales_price');
   
               if ($fromPrice < 0.01 || $salesPrice < $fromPrice)
               {
                   $results[$listingType]['from_price'] = $salesPrice;
               }
           }
   
           return $listings[$this->productId] = $results;
       }
   
       /**
        * Get a list of available specification fields
        *
        * @return  int[]
        *
        * @since   __DEPLOY_VERSION__
        */
       protected function getFields()
       {
           static $pks = null;
   
           if ($pks === null)
           {
               $query = $this->db->getQuery(true);
   
               $query->select('a.id')
                     ->from('#__sellacious_fields a')
                     ->where('a.state = 1')
                     ->where('a.parent_id > 0')
                     ->where('a.context = ' . $this->db->q('product'))
                     ->where('a.type != ' . $this->db->q('fieldgroup'))
                     ->order('a.lft ASC');
   
               $pks = (array) $this->db->setQuery($query)->loadColumn();
           }
   
           return $pks;
       }
   
       /**
        * Method to get the specifications for the active product and given one of its variants
        *
        * @param   int  $variantId  Variant id to query for
        *
        * @return  array
        *
        * @since   __DEPLOY_VERSION__
        */
       protected function getSpecifications($variantId)
       {
           $filter = array(
               'list.select' => 'a.field_id, a.field_value, a.is_json',
               'list.from'   => '#__sellacious_field_values',
               'field_id'    => $this->getFields(),
           );
   
           if ($variantId == 0)
           {
               $filter['table_name'] = 'products';
               $filter['record_id']  = (int) $this->productId;
           }
           else
           {
               $filter['table_name'] = 'variants';
               $filter['record_id']  = (int) $variantId;
           }
   
           $iterator = $this->helper->field->getIterator($filter);
           $values   = array();
   
           foreach ($iterator as $obj)
           {
               $col = sprintf('f%d', $obj->field_id);
   
               $values[$col] = $obj->is_json ? json_decode($obj->field_value) : $obj->field_value;
           }
   
           return $values;
       }
   
       /**
        * Get the manufacturer information for the given manufacturer id
        *
        * @param   int  $id  Manufacturer uid
        *
        * @return  stdClass
        *
        * @since   __DEPLOY_VERSION__
        */
       protected function getManufacturer($id)
       {
           static $cache = array();
   
           if (!isset($cache[$id]))
           {
               try
               {
                   $query = $this->db->getQuery(true);
   
                   $query->select('u.name')
                         ->from($this->db->quoteName('#__users', 'u'))
                         ->where('u.id = ' . (int) $id);
   
                   $query->select('m.title m_company, m.category_id m_catid, m.code m_code')
                       ->join('left', $this->db->quoteName('#__sellacious_manufacturers', 'm') . ' ON m.user_id = u.id');
   
                   $user = $this->db->setQuery($query)->loadObject();
   
                   $cache[$id] = $user ?: false;
               }
               catch (Exception $e)
               {
                   // Ignore
   
                   $cache[$id] = false;
               }
           }
   
           return $cache[$id] ?: null;
       }
   
       /**
        * Get the variant seller attributes
        *
        * @param   int  $variantId
        * @param   int  $sellerUid
        *
        * @return  stdClass
        *
        * @since   __DEPLOY_VERSION__
        */
       protected function getVsx($variantId, $sellerUid)
       {
           $query = $this->db->getQuery(true);
           $cols  = array(
               'vsx_id'                 => 'a.id',
               'variant_price_mod'      => 'a.price_mod',
               'variant_price_mod_perc' => 'a.price_mod_perc',
               'stock'                  => 'a.stock',
               'over_stock'             => 'a.over_stock',
               'stock_reserved'         => 'a.stock_reserved',
               'stock_sold'             => 'a.stock_sold',
               'is_selling_variant'     => 'a.state',
           );
   
           $query->select($this->db->quoteName(array_values($cols), array_keys($cols)))
                 ->from($this->db->quoteName('#__sellacious_variant_sellers', 'a'))
                 ->where('a.variant_id = ' . (int) $variantId)
                 ->where('a.seller_uid = ' . (int) $sellerUid);
   
           return $this->db->setQuery($query)->loadObject();
       }
   
       /**
        * Get seller-specific prices for this product. Please note that all amounts are in seller's currency.
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       protected function addPrices()
       {
           $pTypes = array();
   
           // Collate by pricing type
           foreach ($this->items as $item)
           {
               $pt = $item->get('pricing_type');
   
               $pTypes[$pt] = true;
           }
   
           foreach ($pTypes as $pt => $true)
           {
               $handler = PriceHelper::getHandler($pt);
               $handler->setPricesForCache($this->productId, $this->items);
           }
       }
   
       /**
        * Method to check items that can be display in the list view on account of
        * special listing or best price and grouped display of sellers and variants of a product
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       checkListable()
       {
           let list             = {};
           let array            = {};
           let seller_separate  = config.get['multi_seller'] === 2;
           let variant_separate = config.get['multi_variant'] === 2;
   
           if (variant_separate && seller_separate)
           {
               list = items;
           }
           else if (variant_separate)
           {    
               for (const key in object) {
                   if (object.hasOwnProperty(key)) {
                       const element = object[key];
                       
                   }
               }
               foreach ($this->items as $item)
               {
                   $vid = $item->get('variant_id');
                   $uid = $item->get('seller_uid');
   
                   $array[$vid][$uid] = $item;
               }
   
               static::bestSellerOfEachVariant($array, $list);
           }
           else
           {
               $tmp = array();
   
               foreach ($this->items as $item)
               {
                   $vid = $item->get('variant_id');
                   $uid = $item->get('seller_uid');
   
                   if ($vid > 0 && !$variant_separate)
                   {
                       $item->set('is_visible', 0);
                   }
   
                   $array[$uid][$vid] = $item;
               }
   
               static::bestVariantOfEachSeller($array, $tmp);
   
               if ($seller_separate)
               {
                   $list = $tmp;
               }
               else
               {
                   static::bestSeller($tmp, $list);
               }
           }
   
           foreach ($list as $item)
           {
               $item->set('is_visible', $item->get('spl_category') ? 2 : 1);
           }
       }
   
       /**
        * Method to find the best seller items among given items grouped by variant
        * The minimum price item is taken also
        *
        * @param   Registry[][]  $itemsList
        * @param   Registry[]    $list
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       bestSellerOfEachVariant(itemsList, list = [])
       {
           for (const vid in itemsList) {
               if (object.hasOwnProperty(vid)) {
                   bestSeller(itemsList[vid],list)
               }
       }
   
       /**
        * Method to find the best variant items among given items grouped by seller
        * The minimum price item is taken also
        *
        * @param   Registry[][]  $itemsList
        * @param   Registry[]    $list
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       bestVariantOfEachSeller(itemsList, list=[])
       {
           for (const uid in itemsList) {
               if (object.hasOwnProperty(uid)) {
                   bestVariant(itemsList[uid],list)
               }
           }
       }
   
       /**
        * Method to find the best variant item among given items
        * The minimum price item is taken also
        *
        * @param   Registry[]  $items
        * @param   Registry[]  $list
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
       bestVariant(items, list = [])
       {
           let tmp = null;
           items.forEach((item)=>{

            if (!tmp || item['sales_price'] < tmp['sales_price'])
               {
                   tmp = item;
               }
           })
           if (tmp)
           {
               list = tmp;
           }
       }
   
       /**
        * Method to find the best seller item among given items
        * Special category listed are always taken, and the minimum price item is taken also
        *
        * @param   []  $items
        * @param   []  $list
        *
        * @return  void
        *
        * @since   __DEPLOY_VERSION__
        */
        bestSeller(items, list = [])
        {
           let tmp      = null;
           let use      = false;
           let foundSpl = false;
            for (const item in items) {
                if (object.hasOwnProperty(item)) {
                    if (!item['is_selling'])
                    {
                    continue;
                    }
   
                    if (item['spl_category'])
                    {
                    use      = false;
                    foundSpl = true;
                    tmp      = $item;
   
                   list = item;
                    }
                    elseif (!tmp || item['sales_price'] < tmp['sales_price'])
                    {
                   use = foundSpl ? false : true;
                   tmp = item;
                    }
                }
            }
        }
        /**
        * Load the data for all variants and sellers for this product to be stored in the cache
        *
        * @return  Registry[]  List of cache records for this product
        *
        * @since   __DEPLOY_VERSION__
        */
       getRecords()
       {
           loadProduct();
   
           if (product)
           {
               loadSellerList();
   
               loadVariantList();
   
               loadCategories();
   
               loadTypeAttributes();
   
               loadTypeAttributesSeller();
   
               loadListing();
   
               loadSpecialCategories();
           }
   
           batchProcess();
   
           return items;
       }
   
   })
}

const os = require('os')
const cluster = require("cluster")

  exports.getRecords = (_req,_res,_next)=>{
    if(cluster.isMaster){
        let cpus = os.cpus().length
        for(let i=1;i<=cpus;i++){
          cluster.fork()
        }
        cluster.on('online', function(worker) {
          console.log('Worker ' + worker.process.pid + ' is online');
      });
      
      cluster.on('exit', function(worker, code, signal) {
          console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
          console.log('Starting a new worker');
          cluster.fork();
      });
      }else{
        //write fetch query here
      }
  }
export default class ProductCacheRecord
