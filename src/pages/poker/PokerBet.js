export default function PokerBet(props){
    const {bet} = props;
    if(!bet) return <span/>
    return (<h3 className="bet m-2 p-3 border bg-warning text-right">{bet}</h3>)
}