import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    <article className={`category-card ${category.accent}`}>
      <div className="category-icon" aria-hidden="true">
        {category.icon}
      </div>
      <div className="category-content">
        <h3>{category.title}</h3>
        <p>{category.description}</p>
      </div>
      <Link to={`/category/${category.id}`} className="btn btn-primary">
        Start
      </Link>
    </article>
  );
}
