import SwapBotEdit from "./SwapBotEdit";
import SwapBotList from "./SwapBotList";

export default function SwapBotCabinet(props){
    return props.id ? <SwapBotEdit {...props}/>:<SwapBotList {...props}/>;
}