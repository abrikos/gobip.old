import GameUserInfo from "./GameUserInfo";

export default function GameCabinet(props){

    return <div>
        <h1>My games</h1>
        <GameUserInfo type={'any'} {...props}/>


    </div>
}