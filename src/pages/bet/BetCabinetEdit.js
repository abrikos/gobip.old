import React, {useEffect, useState} from 'react';
import {Button, Form, FormControl} from "react-bootstrap";
import Loader from "components/Loader";
import {A, navigate} from "hookrouter";
import InputDatePicker from "../../components/inputModel/InputDatePicker";
import Select from 'react-select'
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import BetView from "./BetView";
import CopyButton from "../../components/copy-button/CopyButton";

export default function BetCabinetEdit(props) {
    const [bet, setBet] = useState();
    const [pairs, setPairs] = useState([]);
    const [error, setError] = useState();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBet();
        props.store.api('/crypto/pairs')
            .then(setPairs)
        //const timer = setInterval(loadBets, 5000)
        //return () => clearInterval(timer);
    }, [props.id]);

    function loadBet() {
        if (props.id === 'create') return setBet({name: 'New bet'});
        props.store.api('/cabinet/bet/' + props.id)
            .then(d => {
                setBet(d);
            })
    }

    const options = ['<=', '>=', '='].map(o => {
        return {value: o, label: o}
    })

    function submit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setErrors({})
        const form = props.store.formToObject(e.target)
        const errs = {}
        if (!form.pair) errs.pair = 'Pair must be set';
        if (!form.condition) errs.condition = 'Condition must be set';
        if (form.value * 1 <= 0 || !(form.value * 1)) errs.value = 'Value must be greater 0';
        if (!form.checkDate.match(/(\d{4})-(\d{2})-(\d{2})/)) errs.checkDate = 'Wrong date';
        setErrors(errs)
        if (Object.keys(errs).length) return setLoading(false);
        const url = props.id === 'create' ? '/cabinet/bet/create/new' : '/cabinet/bet/update/' + props.id;
        props.store.api(url, form)
            .then(r => {
                setBet(r)
                setLoading(false)
                navigate('/cabinet/bet/' + r.id)
            })
            .catch(r => {
                setLoading(false)
                setError(r)
            })
    }

    function setDate(e) {
        const b = bet;
        b.checkDate = e;
        setBet(b)
    }

    function deleteBet() {
        if (!window.confirm(`Delete ${bet.name}?`)) return;
        props.store.api('/cabinet/bet/delete/' + bet.id)
            .then(() => navigate('/cabinet/bet'))
            .catch(setError)
    }

    if (!bet) return <div/>;
    return <div>
        {bet.sum ? <div className="alert alert-warning">The bet has been paid. Update prohibited</div> : <Form onSubmit={submit}>
            <h1>{bet.name}</h1>
            <div className="alert alert-info"></div>

            Pair
            <Select name="pair" defaultValue={{label: bet.pair, value: bet.pair}} options={pairs.map(p => {
                return {value: `${p.from}-${p.to}`, label: `${p.from}-${p.to}`}
            })}/>
            {errors.pair && <div className="text-danger">{errors.pair}</div>}
            Condition
            <Select name="condition" options={options} defaultValue={{label: bet.condition, value: bet.condition}}/>
            {errors.condition && <div className="text-danger">{errors.condition}</div>}
            Value
            <FormControl key={bet.id} type="number" step="any" name="value" defaultValue={bet.value}/>
            {errors.value && <div className="text-danger">{errors.value}</div>}
            Check date
            <InputDatePicker name="checkDate" defaultValue={bet.checkDateHuman} onChange={setDate}/>
            {errors.checkDate && <div className="text-danger">{errors.checkDate}</div>}
            <hr/>
            <div className="d-flex justify-content-between">
                <Button type="submit">{bet.id ? 'Save' : 'Create'}</Button>
                {bet.id && <Button variant="danger" onClick={deleteBet}><FontAwesomeIcon icon={faTrash}/></Button>}
            </div>
        </Form>}
        <A href={'/cabinet/bet'}> &lt;Back to the my list</A>
        {loading && <Loader/>}
        {error && <div className="alert alert-danger">{error.message}</div>}
        {/*<div className="col-sm-4"><Mixer {...props}/></div>*/}
        {bet.id && <div className="p-0">
            <hr/>
            <BetView id={bet.id} {...props}/>
        </div>}

    </div>

}

