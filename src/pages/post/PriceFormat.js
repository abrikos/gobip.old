import React from "react";

export default function PriceFormat(props) {
    return <span className="price">{!!props.price ? `${props.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₽` : 'Договорная'}</span>
}
