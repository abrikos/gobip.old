export default function UserAvatar(props){
    return <div className="user-avatar d-flex flex-column align-items-center">
        <div className="avatar"><img src={props.photo} alt={props.displayName} className="img-fluid"/></div>
        <div className="nickname">{props.displayName}</div>
    </div>
}