
// use Exception;
// use Joomla\CMS\Factory;
// use Sellacious\Cache\Record\ProductCacheRecord;
// use Sellacious\Event\EventHelper;

const AbstractCacheBuilder = require('./AbstractCacheBuilder')
/**
 * Class ProductsCacheBuilder
 *
 * @package  Sellacious\Cache
 *
 * @since   __DEPLOY_VERSION__
 */
export default class ProductsCacheBuilder extends AbstractCacheBuilder
{
	/**
	 * ProductsCacheBuilder constructor
	 *
	 * @throws  Exception
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	constructor()
	{
		super('products');
	}

	/**
	 * Build the complete cache
	 *
	 * @return  void
	 *
	 * @throws  Exception
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	build()
	{
		db    = Factory.getDbo();
		query = db.getQuery(true);

		query->select('id')->from('#__sellacious_products');

		iterator = $db->setQuery($query)->getIterator();

		this.loadStorage();

		this.store.initialise();

		this.reset();

		this.implicitFlush(100);

        iterator.foreach((o)=>{
            processor = new ProductCacheRecord(o.id);
			records = processor.getRecords();
            records.foreach((record)=>{
                $this->append($record);
            })
        })

		this.flush();

		this.store.finalise();
	}

	/**
	 * Update the specific products' cache
	 *
	 * @param   int[]  $pks  Product ids of modified products
	 *
	 * @return  void
	 *
	 * @throws  Exception
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	rebuild(pks)
	{
		this.loadStorage();

		this.store.delete(pks);

		// $this->beginInsert($this->name);

		this.implicitFlush(100);

        pks.foreach((pk)=>{
            processor = new ProductCacheRecord($pk);
			records   = processor.getRecords();
            records.foreach((record)=>{
                $this->append($record);
            })
            
        })
		this.flush();
		// $this->endInsert();
	}

	/**
	 * Method to update the table with given values where records match given conditions
	 *
	 * @param   array  $values
	 * @param   array  $conditions
	 *
	 * @return  void
	 *
	 * @throws  Exception
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	update(values, conditions)
	{
		this.loadStorage();

		this.store.patch(values, conditions);
	}

	/**
	 * Delete specific row(s) from the storage database
	 *
	 * @param   array  $keys  The filter for the records to be deleted (numeric ids only for now)
	 *
	 * @return  void
	 *
	 * @throws  Exception
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	delete(keys)
	{
		this.loadStorage();

		this.store.delete(keys);
	}

	/**
	 * Get a list of columns relevant to the given table
	 *
	 * @param   string  $tableName  The storage table name to insert into, defaults to current db name
	 *
	 * @return  array
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	getColumns(tableName)
	{
		columns = ProductCacheRecord.getColumns();

		// More cols to add: order_count, order_units, product_rating, product_ordering
		EventHelper.trigger('onFetchCacheColumns', array('context' => 'com_sellacious.product', 'columns' => &$columns));

		return [...new Set(columns)];
	}
}
