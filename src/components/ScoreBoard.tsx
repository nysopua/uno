import React from 'react';
import { Player } from '../App';

interface ScoreBoardProps {
  players: Player[];
  roundMultipliers: number[]; // 各ラウンドの倍率
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ players, roundMultipliers }) => {
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-purple-600">スコアボード</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-center border border-gray-200 font-semibold">順位</th>
              <th className="py-3 px-4 text-left border border-gray-200 font-semibold">プレイヤー</th>
              {players.length > 0 && players[0].scores.map((_, roundIndex) => (
                <th key={roundIndex} className="py-3 px-4 text-center border border-gray-200 font-semibold">
                  R{roundIndex + 1}
                  {roundMultipliers[roundIndex] > 1 && (
                    <span className="ml-1 text-amber-600 font-bold">
                      ({roundMultipliers[roundIndex]}倍)
                    </span>
                  )}
                </th>
              ))}
              <th className="py-3 px-4 text-center border border-gray-200 font-semibold">合計</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr 
                key={player.id} 
                className={index === 0 
                  ? 'bg-yellow-50' 
                  : index % 2 === 0 
                    ? 'bg-gray-50' 
                    : 'bg-white'
                }
              >
                <td className="py-3 px-4 text-center border border-gray-200">
                  <span className={`
                    inline-flex items-center justify-center 
                    ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : index === 2 ? 'bg-amber-600' : 'bg-gray-100'} 
                    ${index <= 2 ? 'text-white' : 'text-gray-700'} 
                    h-6 w-6 rounded-full font-bold
                  `}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-4 border border-gray-200 font-medium">{player.name}</td>
                {player.scores.map((score, roundIndex) => (
                  <td 
                    key={roundIndex} 
                    className={`py-3 px-4 text-center border border-gray-200 
                      ${score < 0 ? 'text-green-600 font-medium' : score > 0 ? 'text-red-600 font-medium' : ''}
                      ${roundMultipliers[roundIndex] > 1 ? 'bg-amber-50' : ''}
                    `}
                  >
                    {score === 0 && roundIndex >= player.scores.filter(s => s !== 0).length ? '-' : score}
                  </td>
                ))}
                <td className="py-3 px-4 text-center border border-gray-200 font-bold">
                  <span className={`
                    ${player.totalScore < 0 ? 'text-green-600' : player.totalScore > 0 ? 'text-red-600' : ''}
                  `}>
                    {player.totalScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreBoard;