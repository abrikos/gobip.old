export default function UserAvatar(props){
    return <div className="user-avatar">
        <img src={props.photo} alt={props.nickname} className="img-fluid"/>
    </div>
}