import React, { useState } from 'react';

interface GameSetupProps {
  onSubmit: (playerNames: string[], totalRounds: number, roundMultipliers: number[]) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onSubmit }) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['プレイヤー1', 'プレイヤー2']);
  const [totalRounds, setTotalRounds] = useState<number>(1);
  const [roundMultipliers, setRoundMultipliers] = useState<number[]>([1]);
  const [error, setError] = useState<string>('');
  const [showMultiplierSetup, setShowMultiplierSetup] = useState<boolean>(false);

  // プレイヤー数変更時の処理
  const handlePlayerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    if (count < 2) return;
    if (count > 10) return;

    setPlayerCount(count);
    setPlayerNames(prevNames => {
      const newNames = [...prevNames];
      
      // プレイヤーが増えた場合、新しい名前を追加
      if (count > prevNames.length) {
        for (let i = prevNames.length; i < count; i++) {
          newNames.push(`プレイヤー${i + 1}`);
        }
      } 
      // プレイヤーが減った場合、余分な名前を削除
      else if (count < prevNames.length) {
        return newNames.slice(0, count);
      }
      
      return newNames;
    });
  };

  // プレイヤー名変更時の処理
  const handlePlayerNameChange = (index: number, name: string) => {
    setPlayerNames(prevNames => {
      const newNames = [...prevNames];
      newNames[index] = name;
      return newNames;
    });
  };

  // ラウンド数変更時の処理
  const handleRoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rounds = parseInt(e.target.value);
    if (rounds < 1) return;
    if (rounds > 50) return; // 最大ラウンド数を制限
    
    setTotalRounds(rounds);
    
    // ラウンド数に合わせて倍率の配列も更新
    setRoundMultipliers(prevMultipliers => {
      if (rounds > prevMultipliers.length) {
        // 新しいラウンドを追加（デフォルトは1倍）
        return [...prevMultipliers, ...Array(rounds - prevMultipliers.length).fill(1)];
      } else if (rounds < prevMultipliers.length) {
        // 余分なラウンドを削除
        return prevMultipliers.slice(0, rounds);
      }
      return prevMultipliers;
    });
  };

  // 倍率変更時の処理
  const handleMultiplierChange = (roundIndex: number, value: string) => {
    const multiplierValue = parseInt(value);
    
    setRoundMultipliers(prevMultipliers => {
      const newMultipliers = [...prevMultipliers];
      newMultipliers[roundIndex] = multiplierValue;
      return newMultipliers;
    });
  };

  // 倍率設定画面の切り替え
  const toggleMultiplierSetup = () => {
    setShowMultiplierSetup(!showMultiplierSetup);
  };

  // フォーム送信時の処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (playerCount < 2) {
      setError('プレイヤーは最低2人必要です');
      return;
    }
    
    if (totalRounds < 1) {
      setError('ラウンド数は最低1回必要です');
      return;
    }
    
    const hasEmptyName = playerNames.some(name => name.trim() === '');
    if (hasEmptyName) {
      setError('すべてのプレイヤー名を入力してください');
      return;
    }
    
    // 重複するプレイヤー名をチェック
    const uniqueNames = new Set(playerNames);
    if (uniqueNames.size !== playerNames.length) {
      setError('プレイヤー名は一意である必要があります');
      return;
    }
    
    setError('');
    onSubmit(playerNames, totalRounds, roundMultipliers);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">ゲーム設定</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="playerCount" className="block font-medium text-gray-700">プレイヤー数:</label>
          <input
            type="number"
            id="playerCount"
            min="2"
            max="10"
            value={playerCount}
            onChange={handlePlayerCountChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="rounds" className="block font-medium text-gray-700">ラウンド数:</label>
          <input
            type="number"
            id="rounds"
            min="1"
            max="50"
            value={totalRounds}
            onChange={handleRoundChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        
        {/* 倍率設定トグルボタン */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleMultiplierSetup}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium text-gray-700 transition-colors"
          >
            {showMultiplierSetup ? 'ラウンドの倍率設定を閉じる' : 'ラウンドごとの倍率を設定する'}
          </button>
        </div>
        
        {/* 倍率設定パネル */}
        {showMultiplierSetup && (
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-4">
            <h3 className="text-lg font-medium text-gray-800">ラウンドごとの倍率設定</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {roundMultipliers.map((multiplier, index) => (
                <div key={index} className="space-y-1">
                  <label htmlFor={`multiplier-${index}`} className="block text-sm font-medium text-gray-700">
                    ラウンド {index + 1}:
                  </label>
                  <select
                    id={`multiplier-${index}`}
                    value={multiplier}
                    onChange={(e) => handleMultiplierChange(index, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1">1倍</option>
                    <option value="2">2倍</option>
                    <option value="3">3倍</option>
                    <option value="5">5倍</option>
                  </select>
                </div>
              ))}
            </div>
            {roundMultipliers.some(m => m > 1) && (
              <p className="text-sm text-amber-600">
                倍率の設定された回には点数が通常より大きくなります。
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-4 mt-6">
          <h3 className="text-xl font-medium text-gray-800">プレイヤー名:</h3>
          {playerNames.map((name, index) => (
            <div key={index} className="space-y-1">
              <label htmlFor={`player-${index}`} className="block font-medium text-gray-700">
                プレイヤー {index + 1}:
              </label>
              <input
                type="text"
                id={`player-${index}`}
                value={name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          ))}
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          ゲーム開始
        </button>
      </form>
    </div>
  );
};

export default GameSetup;