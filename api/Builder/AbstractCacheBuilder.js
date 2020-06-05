
const fs = require('fs')
/**
 * Class AbstractCacheBuilder
 *
 * @package  Sellacious\Cache
 *
 * @since   __DEPLOY_VERSION__
 */

export default class AbstractCacheBuilder
{
	/**
	 * CacheBuilder constructor
	 *
	 * @param   string  $name  Cache object name
	 *
	 * @throws  Exception
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	construct(name)
	{
		/**
	 * Cache object name
	 *
	 * @var   string
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	this.name = name;

	/**
	 * Names of the columns names to be used in the cache table
	 *
	 * @var   string[]
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	columns = [];

	/**
	 * Record index to track how many records are currently appended. Not using <var>count($records)</var> intentionally
	 *
	 * @var   int
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	this.cursor = 0;

	/**
	 * Records queued to be added to the cache table
	 *
	 * @var   Registry[]
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	this.records = [];

	/**
	 * Number of records to hold before writing out data to the cache table. Zero value means no auto writing.
	 *
	 * @var   int
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	this.implicitFlush = 0;

	/**
	 * The storage handler
	 *
	 * @var   AbstractCacheStorageBuild
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	this.store;

	}

	/**
	 * The instance name
	 *
	 * @return  string
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	getName()
	{
		return this.name;
	}

	/**
	 * The insert queue
	 *
	 * @return  Registry[]
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	getRecords()
	{
		return this.records;
	}

	/**
	 * The insert queue size
	 *
	 * @return  int
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	getCursor()
	{
		return this.cursor;
	}

	/**
	 * Load the cache storage handler
	 *
	 * @return  void
	 *
	 * @throws  Exception
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	loadStorage()
	{
		let config = ConfigHelper.getInstance('com_sellacious');

		if (config.get('cache_storage_handler', 'remote') === 'remote')
		{
			this.store = new RemoteCacheStorageBuild(this);
		}
		else
		{
			this.store = new SqliteCacheStorageBuild(this);
		}
	}

	/**
	 * Build the complete cache
	 *
	 * @return  void
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	build(){
    throw new Error('Implement the method build in extended class')
  }

	/**
	 * Delete specific row(s) from the storage database
	 *
	 * @param   array  $keys  The filter for the records to be deleted
	 *
	 * @return  void
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	delete(keys){
    throw new Error('Implement the method delete in extended class')
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
	rebuild(pks){
    throw new Error('Implement the method rebuild in extended class')
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
	update(values, conditions){
    throw new Error('Implement the method update in extended class')
  };

	/**
	 * Get a list of columns relevant to the given table
	 *
	 * @param   string  $tableName  The storage table name to insert into, defaults to current db name
	 *
	 * @return  array
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	getColumns(tableName){
    throw new Error('Implement the method update in extended class')
  };

	/**
	 * Enable implicit flush to the output database
	 *
	 * @param   int  $value  Flush automatically after {$value} records are appended. Set zero value to disable.
	 *
	 * @return  void
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	implicitFlush(value = 0)
	{
		this.implicitFlush = parseInt(value);
	}

	/**
	 * Append a new record to the cache,
	 * It will be written to the storage automatically if implicit flush is enabled
	 * Otherwise you need to call <var>flush()</var> when needed
	 *
	 * @param   Registry  $record  The record to insert
	 *
	 * @return  void
	 *
	 * @throws  Exception
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	append(record)
	{
		this.records = record;

		this.cursor++;

		if (this.implicitFlush > 0 && this.cursor >= this.implicitFlush)
		{
			this.flush();
		}
	}

	/**
	 * Write the records stored in write queue to the storage
	 *
	 * @return  void
	 *
	 * @throws  Exception
	 *
	 * @since   __DEPLOY_VERSION__
	 */
  flush()
	{
		flush     = false;
		isRunning = CacheHelper.isRunning();

		if (isRunning)
		{
			my_pid   = getmypid();
			tmp      = Factory.getConfig().get('tmp_path');
			curr_pid = fs.readFileSync(tmp + '/.s-cache-lock/pid','utf-8').trim();

			if (curr_pid == my_pid)
			{
				flush = true;
			}
		}

		if (!flush)
		{
			throw new Exception('Aborting cache flush as lock file removed externally.');
		}

		this.store.flush();

		this.reset();
	}

	/**
	 * Reset the write queue
	 * This should be called after writing the cache or when a write is not desired
	 *
	 * @return  void
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	reset()
	{
		this.records = [];
		this.cursor  = 0;
	}
}
