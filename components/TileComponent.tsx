import React from 'react';
import { Tile, TileType, Player, PLAYER_COLORS } from '../types';

interface TileComponentProps {
  tile: Tile;
  playersOnTile: Player[];
  ownerColor?: string; // Color of the owner (e.g., 'bg-red-500')
  onClick: (tile: Tile) => void;
}

const TileComponent: React.FC<TileComponentProps> = ({ tile, playersOnTile, ownerColor, onClick }) => {
  let containerClasses = 'bg-white border-gray-300';
  let iconDisplay = tile.icon || '';
  
  // Determine styling based on type and ownership
  if (tile.type === TileType.CITY) {
      if (tile.ownerId !== null) {
          // Owner specific styles
          // Use provided ownerColor or fallback to default array based on index
          const colorBase = ownerColor || PLAYER_COLORS[tile.ownerId % PLAYER_COLORS.length]; 
          
          // Extract color name (e.g., 'red', 'blue') assuming format 'bg-COLOR-500'
          const colorName = colorBase.replace('bg-', '').replace('-500', '');
          
          const bgClass = `bg-${colorName}-100`;
          const borderClass = `border-${colorName}-600`;
          
          // Thicker border for owned properties
          containerClasses = `${bgClass} ${borderClass} border-2 md:border-4`; 
      } else {
          containerClasses = 'bg-blue-50 border-blue-400';
      }
  } else if (tile.type === TileType.START) {
      containerClasses = 'bg-red-50 border-red-500';
  } else if (tile.type === TileType.QUIZ) {
      containerClasses = 'bg-yellow-50 border-yellow-500';
  } else if (tile.type === TileType.PARK) {
      containerClasses = 'bg-green-50 border-green-500';
  } else if (tile.type === TileType.DONATION) {
      containerClasses = 'bg-gray-100 border-gray-500';
  } else if (tile.type === TileType.EVENT) {
      containerClasses = 'bg-purple-50 border-purple-500';
  }

  const renderOwnerBadge = () => {
    if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
    const badgeColor = ownerColor || PLAYER_COLORS[tile.ownerId % PLAYER_COLORS.length];
    return (
      <div className={`absolute top-0 left-0 px-1.5 py-0.5 md:px-2 md:py-1 rounded-br-lg text-[9px] md:text-xs font-black text-white shadow-sm z-10 ${badgeColor} border-r border-b border-white/20`}>
        P{tile.ownerId + 1}
      </div>
    );
  };

  const renderBuildingIndicator = () => {
    if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
    
    let indicator = null;
    if (tile.buildingLevel === 1) {
        // House
        indicator = <span className="text-base md:text-2xl filter drop-shadow-md">🏠</span>;
    } else if (tile.buildingLevel === 2) {
        // Building
        indicator = <span className="text-lg md:text-3xl filter drop-shadow-md">🏢</span>;
    }

    if (!indicator) return null;

    return (
       <div className="absolute top-0 right-0 p-0.5 z-10">
          {indicator}
       </div>
    );
  };

  const renderBuildingStars = () => {
      if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
      
      const stars = [];
      for(let i=0; i<tile.buildingLevel; i++) {
          stars.push(<span key={i}>⭐</span>);
      }
      
      if (stars.length === 0) {
        // Level 0 (Land Only)
        return <span className="text-[9px] md:text-xs font-extrabold text-slate-700 bg-white/50 px-1 rounded whitespace-nowrap">토지</span>;
      }
      return <div className="flex gap-0.5 text-[9px] md:text-xs">{stars}</div>;
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-between p-0.5 md:p-1 w-full h-full border rounded-md md:rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer select-none overflow-hidden ${containerClasses}`}
      onClick={() => onClick(tile)}
    >
      {renderOwnerBadge()}
      {renderBuildingIndicator()}

      {/* Header: Name */}
      {/* Changed truncate to break-words and adjusted line-height/size to prevent cutting off text like '환경 부담금' */}
      <div className={`w-full text-center text-[9px] sm:text-[10px] md:text-base font-black px-0.5 tracking-tight text-black drop-shadow-sm break-words leading-tight ${tile.ownerId !== null ? 'mt-3 md:mt-5' : 'mt-1'}`}>
        {tile.name}
      </div>

      {/* Center: Icon & Status */}
      <div className="flex flex-col items-center justify-center flex-1 w-full overflow-hidden my-0.5">
        <span className="text-xl sm:text-2xl md:text-5xl drop-shadow-md transform hover:scale-110 transition-transform duration-200">
            {iconDisplay}
        </span>
        
        <div className="mt-0.5 md:mt-2 flex flex-col items-center justify-center min-h-[16px] md:min-h-[20px] w-full">
             {tile.type === TileType.CITY ? (
                 tile.ownerId !== null ? renderBuildingStars() : <span className="text-black font-extrabold text-[10px] md:text-sm bg-white/60 px-1.5 rounded-full shadow-sm">{tile.price}</span>
             ) : (
                 <span className="hidden md:block text-[9px] md:text-xs text-gray-900 font-bold text-center leading-tight break-words px-1 bg-white/40 rounded w-full">
                     {tile.description}
                 </span>
             )}
        </div>
      </div>

      {/* Footer: Players present */}
      <div className="flex flex-wrap justify-center gap-0.5 md:gap-1.5 w-full min-h-[12px] md:min-h-[30px] items-end pb-0.5 px-0.5">
        {playersOnTile.map(p => (
          <div 
            key={p.id} 
            className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-7 md:h-7 rounded-full border border-white shadow-lg ${p.color} transform transition-all duration-300 z-20 ring-1 ring-black/20`} 
            title={p.name}
          />
        ))}
      </div>
    </div>
  );
};

export default TileComponent;