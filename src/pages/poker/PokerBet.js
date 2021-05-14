export default function PokerBet(props){
    const {bet} = props;
    return (<strong className="bet m-2 p-3 border bg-warning text-right">{bet}</strong>)
}