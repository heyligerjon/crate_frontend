import React, { useState, useEffect, useLayoutEffect } from "react";
import { config } from '../../const/constants'
import AlbumCard from "./albumcard";

const URL = config.blog_api

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

export default function Carousel(props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [articles, setArticles] = useState([]);
    const [width, height] = useWindowSize();

    const FetchArticle = async () => {
        await fetch(`${URL}/articles/`, {
            method: 'GET',
        })
          .then((response) => response.json())
          .then((result) => {
            if (result.error) {
              console.log('Error:', result.error);
              return false;
            }
            setArticles(result);
            console.log(result)
          });
    };

    useEffect(() => {
        FetchArticle();
    }, []);

    const getNext = () => {
        const firstElement = articles.shift();
        setArticles([...articles, firstElement]);
        setCurrentIndex(currentIndex === articles.length - 1 ? 0 : currentIndex + 1);
    }

    const getPrev = () => {
        const lastElement = articles.pop();
        setArticles([lastElement, ...articles]);
        setCurrentIndex(currentIndex === 0 ? articles.length - 1 : currentIndex - 1);
    }

    const handleHover = (index) => {
        let name = document.getElementById(`col-${index}`)
        let covers = document.getElementsByClassName('column')

        for(let i = 0; i < covers.length; i++) {
            if (i < index) {
                covers.item(i).style.transform = 'translate(0)'
            }
            else if (i === index) {
                covers.item(i).style.transform = 'translate(0, -5rem)'
            }
            else {
                covers.item(i).style.transform = `translate(75px, 0)`
            }
        }
        name.className = 'column active'
        //name.style.transform = `translate(${index <= currentIndex ? 0 : 75}px, ${index === currentIndex ? -5 : 0}rem`
        setCurrentIndex(index);
        // set left of next indexes to += 150px 
    };

    const handleLeave = (index) => {
        let name = document.getElementsByClassName('column active');
        name = name.item(0);
        name.className = 'column';
        name.style.transform = `translate(0px)`;
        setCurrentIndex(index === 0 ? articles.length - 1 : index - 1);
    }

    var articleList;

    if (width > 768) {
        articleList = articles.map((article, index) => 
            <div 
            key={index} 
            id={`col-${index}`}
            className={`column`}
            onMouseEnter={() => handleHover(index)}
            onMouseLeave={() => handleLeave(index)}
            style={{
                left: `${index*75}px`}}
            >
                <AlbumCard 
                article={article} 
                orientation="card" 
                width={300}
                />
            </div>
        );
    }
    else {
        articleList = articles.slice(-3).map((article, index) => 
            <div key={index} className={`column`} style={{transform: 'translate(0px)'}}>
                <AlbumCard 
                article={article} 
                orientation="card" 
                width="300"
                />
            </div>
        );
    }

    return(
        <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h1 className="header hero-header">&lt;recent.articles&gt;</h1>
            <div className="hero-body home-hero">
                <ul className="article-list">
                    {articleList}
                </ul>
            </div>
            <div className="hero-footer card-buttons">
                <button onClick={getPrev} className="button">
                    <span className="fit">&lt;</span>
                </button>
                <button onClick={getNext} className="button">
                    <span className="fit">&gt;</span>
                </button>
            </div>
        </div>
    )
}