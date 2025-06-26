import React, { useState } from 'react';
import { Player } from '../App';

interface ScoreInputProps {
  players: Player[];
  onSubmit: (scores: number[]) => void;
  roundNumber: number;
  currentRoundMultiplier: number;
}

const ScoreInput: React.FC<ScoreInputProps> = ({ 
  players, 
  onSubmit, 
  roundNumber,
  currentRoundMultiplier = 1 // デフォルト値は1
}) => {
  const [scores, setScores] = useState<number[]>(Array(players.length).fill(0));
  const [error, setError] = useState<string>('');
  const [calculatedIndex, setCalculatedIndex] = useState<number | null>(null);

  // スコア変更時の処理
  const handleScoreChange = (index: number, value: string) => {
    // 自動計算されたフィールドがあれば、リセット
    if (calculatedIndex !== null) {
      setCalculatedIndex(null);
    }
    
    const scoreValue = value === '' ? 0 : parseInt(value);
    
    setScores(prevScores => {
      const newScores = [...prevScores];
      newScores[index] = isNaN(scoreValue) ? 0 : scoreValue;
      return newScores;
    });
  };

  // 最後の一人のスコアを計算
  const calculateLastScore = () => {
    // 入力されていないフィールドを探す（最初に見つかった0の値を持つインデックス）
    const emptyIndex = scores.findIndex(score => score === 0);
    
    // 空のフィールドが見つからない場合は何もしない
    if (emptyIndex === -1) return;
    
    // 空のフィールドを除外した合計を計算
    const currentSum = scores.reduce((sum, score, idx) => 
      idx === emptyIndex ? sum : sum + score, 0);
    
    // 最後のフィールドの値を計算（合計が0になるようにする）
    const lastFieldValue = -currentSum;
    
    // 計算結果を反映
    setScores(prevScores => {
      const newScores = [...prevScores];
      newScores[emptyIndex] = lastFieldValue;
      return newScores;
    });
    
    // 計算されたフィールドのインデックスを保存
    setCalculatedIndex(emptyIndex);
  };

  // フォーム送信時の処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // スコアが入力されているか確認
    const hasScores = scores.some(score => score !== 0 || score === 0);
    if (!hasScores) {
      setError('少なくとも1人のスコアを入力してください');
      return;
    }
    
    // スコアの合計が0になるか確認
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    if (totalScore !== 0) {
      setError('1ラウンドでのスコア合計は0になるようにしてください');
      return;
    }
    
    setError('');
    onSubmit(scores);
    
    // スコアをリセット
    setScores(Array(players.length).fill(0));
    setCalculatedIndex(null);
  };

  // 値が入力されている（0でない）フィールドの数をカウント
  const filledFieldsCount = scores.filter(score => score !== 0).length;
  
  // 自動計算ボタンを有効にする条件：
  // 入力済みフィールドの数が「プレイヤー数-1」と等しい（残り1人ちょうど）
  const enableAutoCalculate = filledFieldsCount === players.length - 1;

  // 入力状態を確認
  const isExactlyOneEmpty = filledFieldsCount === players.length - 1;
  const isAllFilled = filledFieldsCount === players.length;
  
  // 残り入力必要数
  const remainingInputs = players.length - filledFieldsCount - 1;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-600">ラウンド {roundNumber} スコア入力</h2>
        {currentRoundMultiplier > 1 && (
          <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">
            {currentRoundMultiplier}倍ラウンド
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentRoundMultiplier > 1 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-700 font-medium">
              このラウンドのスコアは {currentRoundMultiplier}倍 になります！
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player, index) => {
            const isCalculated = calculatedIndex === index;
            return (
              <div key={player.id} className="space-y-2">
                <label 
                  htmlFor={`score-${player.id}`} 
                  className="block font-medium text-gray-700"
                >
                  {player.name}:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id={`score-${player.id}`}
                    value={scores[index] || ''}
                    onChange={(e) => handleScoreChange(index, e.target.value)}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-green-500 transition-all
                      ${isCalculated 
                        ? 'bg-green-50 border-green-300 focus:ring-green-500' 
                        : 'border-gray-300 focus:ring-green-500'
                      }
                    `}
                  />
                  {isCalculated && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        自動計算
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 自動計算ボタン */}
        <div>
          <button
            type="button"
            onClick={calculateLastScore}
            disabled={!enableAutoCalculate}
            className={`w-full font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${enableAutoCalculate
                ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isAllFilled 
              ? '全員入力済みです'
              : isExactlyOneEmpty 
                ? '残りのスコアを自動計算'
                : `残り${remainingInputs}人の入力が必要です`
            }
          </button>
          {!isExactlyOneEmpty && !isAllFilled && (
            <p className="text-xs text-gray-500 mt-1 text-center">
              残り1人分のスコアになるまで自動計算できません
            </p>
          )}
          {isAllFilled && (
            <p className="text-xs text-gray-500 mt-1 text-center">
              全員のスコアが入力されています
            </p>
          )}
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}
        
        <button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        >
          スコア記録
        </button>
      </form>
    </div>
  );
};

export default ScoreInput;