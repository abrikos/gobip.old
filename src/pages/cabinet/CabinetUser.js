import React from 'react';
import "./cabinet.sass"
import {Button, Form, FormControl} from "react-bootstrap";
import UserAvatar from "./UserAvatar";
import MinterValue from "../../components/minter/MinterValue";

export default function CabinetUser(props) {
    const user = props.user

    //const [user, setUser] = useState(props.user);

    function submit(e) {
        e.preventDefault();
        const form = props.store.formToObject(e.target)
        props.store.api('/cabinet/user/update', form)
        //.then(setUser)
    }

    if (!user) return <div/>
    return <div className="cabinet">

        <Form onSubmit={submit}>
            <div className={`${user.address ? 'text-success' : 'text-danger'}`}>
                Address for all payments from the system. {user.address ? '' : <strong>No address specified. You will not receive payments from the system!</strong>}
                <FormControl name="address" defaultValue={user.address}/>
            </div>

            <div>
                Nickname
                <FormControl name="name" defaultValue={user.name}/>
            </div>
            <div>Photo
                <FormControl name="photo" defaultValue={user.photo}/>
            </div>
            <div className="d-flex justify-content-center">
                <UserAvatar {...user}/>
            </div>


            <Button type="submit">Save</Button>
        </Form>
        <hr/>
        <h3>Referrals log</h3>
        <table className="table">
            <thead>
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Referral</th>
            </tr>
            </thead>
            <tbody>
            {user.referralLog.map(r=><tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.type}</td>
                <td><MinterValue value={r.amount} {...props}/></td>
                <td><UserAvatar horizontal {...r.referral}/></td>

            </tr>)}
            </tbody>
        </table>


    </div>

}

