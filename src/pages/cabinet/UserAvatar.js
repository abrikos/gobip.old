export default function UserAvatar(props){
    return <div className={`user-avatar d-flex ${props.horizontal ? '' : 'flex-column'} align-items-center`}>
        <div className="avatar"><img src={props.photo} alt={props.name} className="img-fluid"/></div>
        <div className="nickname">{props.name}</div>
    </div>
}