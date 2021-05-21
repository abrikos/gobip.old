import PokerCard from "../../games/Poker/PokerCard";
import React from "react";
import UserAvatar from "../cabinet/UserAvatar";
import {CountdownCircleTimer} from "react-countdown-circle-timer";

export default function PokerPlayerCards(props) {
    const {who, poker, showTimer} = props;

    return (
        <div className="d-flex  justify-content-between align-items-center">
            <div className="d-flex align-items-center">
                {poker[`${who}Cards`].map((p, i) => <PokerCard {...p} key={i}/>)}
            </div>
            {showTimer && poker.timerEnabled && poker.secondsLeft}
            <div>


                {showTimer && poker.timerEnabled && <CountdownCircleTimer
                    key={poker.timer}
                    isPlaying
                    size={100}
                    duration={120}
                    colors={[
                        ['#004777', 0.33],
                        ['#F7B801', 0.33],
                        ['#A30000', 0.33],
                    ]}
                >
                    {({ remainingTime }) => remainingTime}
                </CountdownCircleTimer>}
            </div>
            <UserAvatar {...poker[who]}/>
        </div>
    )
}