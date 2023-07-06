/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import classNames from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map((product) => {
  const category = categoriesFromServer.find(productCategory => (
    product.categoryId === productCategory.id
  )) || null;
  const user = usersFromServer.find(person => (
    category.ownerId === person.id
  )) || null;

  return {
    ...product,
    categoryName: category.title,
    icon: category.icon,
    userName: user.name,
    userSex: user.sex,
  };
});

const getPreparedProducts = (
  productsForFilter,
  {
    userFilter,
    productFilter,
    categoryFilter,
    sortField,
    isReversed,
  },
) => {
  let preparedProducts = [...productsForFilter];

  if (userFilter) {
    preparedProducts = preparedProducts.filter(product => (
      product.userName === userFilter
    ));
  }

  if (productFilter) {
    const lowerFilter = productFilter.toLowerCase();

    preparedProducts = preparedProducts.filter(product => (
      product.name.toLowerCase().includes(lowerFilter)
    ));
  }

  if (categoryFilter.length > 0) {
    preparedProducts = preparedProducts.filter(product => (
      categoryFilter.includes(product.categoryName)
    ));
  }

  if (sortField) {
    preparedProducts.sort((product1, product2) => {
      switch (sortField) {
        case 'ID':
          return product1.id - product2.id;
        case 'Product':
        case 'Category':
        case 'User':
          return product1.name.localeCompare(product2.name);
        default:
          return 0;
      }
    });
  }

  if (isReversed) {
    preparedProducts.reverse();
  }

  return preparedProducts;
};

export const App = () => {
  const [userFilter, setUserFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [sortField, setSortField] = useState('');
  const [isReversed, setIsReversed] = useState(false);

  const visibleProducts = getPreparedProducts(
    products,
    {
      userFilter,
      productFilter,
      categoryFilter,
      sortField,
      isReversed,
    },
  );

  const addCategory = (field) => {
    setCategoryFilter((prevFilter) => {
      if (prevFilter.includes(field)) {
        return prevFilter.filter(element => element !== field);
      }

      return [...prevFilter, field];
    });
  };

  const resetAll = () => {
    if (userFilter) {
      setUserFilter('');
    }

    if (productFilter) {
      setProductFilter('');
    }

    if (categoryFilter.length > 0) {
      setCategoryFilter([]);
    }
  };

  const setSortIcons = (sortName) => {
    if (sortName === sortField && !isReversed) {
      return (
        <a
          href="#/"
          onClick={() => {
            setSortField(sortName);
            setIsReversed(true);
          }}
        >
          <span className="icon">
            <i data-cy="SortIcon" className="fas fa-sort-up" />
          </span>
        </a>
      );
    }

    if (sortName === sortField && isReversed) {
      return (
        <a
          href="#/"
          onClick={() => {
            setSortField('');
            setIsReversed(false);
          }}
        >
          <span className="icon">
            <i data-cy="SortIcon" className="fas fa-sort-down" />
          </span>
        </a>
      );
    }

    return (
      <a
        href="#/"
        onClick={() => setSortField(sortName)}
      >
        <span className="icon">
          <i data-cy="SortIcon" className="fas fa-sort" />
        </span>
      </a>

    );
  };

  const ProductList = ({ productsToShow }) => (
    <table
      data-cy="ProductTable"
      className="table is-striped is-narrow is-fullwidth"
    >
      <thead>
        <tr>
          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              ID

              {setSortIcons('ID')}
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Product

              {setSortIcons('Product')}
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Category

              {setSortIcons('Category')}
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              User

              {setSortIcons('User')}
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        {productsToShow.map(product => (
          <tr
            key={product.id}
            data-cy="Product"
          >
            <td className="has-text-weight-bold" data-cy="ProductId">
              {product.id}
            </td>

            <td data-cy="ProductName">{product.name}</td>
            <td data-cy="ProductCategory">{`${product.icon} - ${product.categoryName}`}</td>

            <td
              data-cy="ProductUser"
              className={classNames({
                'has-text-link': product.userSex === 'm',
                'has-text-danger': product.userSex === 'f',
              })}
            >
              {product.userName}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const ProductsPlaceholder = (
    <p data-cy="NoMatchingMessage">
      No products matching selected criteria
    </p>
  );

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => setUserFilter('')}
                className={classNames({
                  'is-active': userFilter === '',
                })}
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  onClick={() => setUserFilter(user.name)}
                  className={classNames({
                    'is-active': user.name === userFilter,
                  })}
                >
                  {user.name}
                </a>
              ))}

            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={productFilter}
                  onChange={event => setProductFilter(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {productFilter && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setProductFilter('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={classNames('button is-success mr-6 ', {
                  'is-outlined': categoryFilter.length !== 0,
                })}
                onClick={() => setCategoryFilter([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={classNames('button mr-2 my-1', {
                    'is-info': categoryFilter.includes(category.title),
                  })}
                  href="#/"
                  onClick={() => addCategory(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetAll}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length === 0
            ? ProductsPlaceholder
            : <ProductList productsToShow={visibleProducts} />}
        </div>
      </div>
    </div>
  );
};
