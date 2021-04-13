import React, {useState} from "react";
import {Carousel, CarouselCaption, CarouselControl, CarouselIndicators, CarouselItem} from 'react-bootstrap';
import FileList from "components/file-list/FileList";

export default function FileCarousel(props) {
    const items = props.files.map(i => ({src: i.path}))
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const next = () => {
        if (animating) return;
        const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    }

    const previous = () => {
        if (animating) return;
        const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    }

    const goToIndex = (newIndex) => {
        if (animating) return;
        setActiveIndex(newIndex);
    }

    const slides = items.map((item) => {
        return (
            <CarouselItem
                onExiting={() => setAnimating(true)}
                onExited={() => setAnimating(false)}
                key={item.src}
            >
                <img src={item.src} alt={item.altText}/>
                <CarouselCaption captionText={''} captionHeader={''}/>
            </CarouselItem>
        );
    });

    return <div>
        <Carousel
            className="image-carousel d-sm-block d-none"
            activeIndex={activeIndex}
            next={next}
            previous={previous}
        >
            <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex}/>
            {slides}
            <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous}/>
            <CarouselControl direction="next" directionText="Next" onClickHandler={next}/>
        </Carousel>
        <div className="d-sm-none d-block"><FileList files={props.files}/></div>
    </div>

}
