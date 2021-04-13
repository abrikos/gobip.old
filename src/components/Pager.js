import {Pagination} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";

Pager.propTypes = {
    count: PropTypes.number.isRequired,
    filter: PropTypes.object.isRequired,
    onPageChange: PropTypes.func.isRequired,
};


export default function Pager(props) {
    const [pages, setPages] = useState([]);
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(props.count / (props.filter.limit || 10));
    const paginationLength = 5;

    useEffect(calcPages, [])


    function setCurrentPage(p) {
        if (p < 0 || p >= totalPages) return;
        calcPages(p);
        const f = {...props.filter};
        f.skip = f.limit * p;
        setPage(p);
        props.onPageChange(f)
    }

    function calcPages(page) {
        if (!page) page = 1;
        let pgs = [];
        const from = paginationLength * Math.floor(page / paginationLength);

        const to = from + paginationLength > totalPages ? totalPages : from + paginationLength;
        for (let i = from; i < to; i++) {
            pgs.push(i)
        }
        setPages(pgs)
    }

    if (pages.length < 2) return <div></div>;
    return <div className="d-flex justify-content-center">
        <Pagination>
            {page >= paginationLength && <Pagination.Item key={0} onClick={() => setCurrentPage(0)}>
                &lt;&lt;
            </Pagination.Item>}

            {!!page && <Pagination.Item key={page - 1} onClick={() => setCurrentPage(page - 1)}>
                &lt;
                {/*<Pagination.Link onClick={() => setCurrentPage(page - 1)}> &lt; </Pagination.Link>*/}
            </Pagination.Item>}

            {pages.map(p => <Pagination.Item key={p} active={p === page} onClick={() => setCurrentPage(p)}>
                {/*<Pagination.Link onClick={() => setCurrentPage(p)}>*/}
                {p + 1}
                {/*</Pagination.Link>*/}
            </Pagination.Item>)}

            {page < totalPages - 1 && <Pagination.Item key={page + 1} onClick={() => setCurrentPage(page + 1)}>
                &gt;
            </Pagination.Item>}

            {page < totalPages - 1 && <Pagination.Item key={totalPages} onClick={() => setCurrentPage(totalPages - 1)}>
                >>
            </Pagination.Item>}

        </Pagination>
    </div>

}
