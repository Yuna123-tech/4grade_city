
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
  let nameColorClass = 'text-black';
  let priceColorClass = 'text-black bg-white/60';
  
  // Determine styling based on type and ownership
  if (tile.type === TileType.CITY) {
      if (tile.ownerId !== null) {
          const colorBase = ownerColor || PLAYER_COLORS[tile.ownerId % PLAYER_COLORS.length]; 
          
          if (tile.buildingLevel === 3) {
             // LANDMARK: Full solid color background
             containerClasses = `${colorBase} border-white border-[1.5px] md:border-4 shadow-lg ring-2 ring-yellow-400`;
             nameColorClass = 'text-white drop-shadow-md';
             priceColorClass = 'text-white bg-black/20';
          } else {
             // Normal buildings: Tinted background
             const colorName = colorBase.replace('bg-', '').replace('-500', '');
             const bgClass = `bg-${colorName}-100`;
             const borderClass = `border-${colorName}-600`;
             containerClasses = `${bgClass} ${borderClass} border-[1.5px] md:border-4`; 
          }
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
  } else if (tile.type === TileType.AIRPORT) {
      containerClasses = 'bg-sky-100 border-sky-600';
  }

  const renderOwnerBadge = () => {
    if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
    
    const badgeColor = ownerColor || PLAYER_COLORS[tile.ownerId % PLAYER_COLORS.length];
    const borderClass = tile.buildingLevel === 3 ? 'border-white' : 'border-white/20';
    
    return (
      <div className={`absolute top-0 left-0 px-0.5 rounded-br text-[5px] md:text-xs font-black text-white shadow-sm z-20 ${badgeColor} border-r border-b ${borderClass} leading-none py-0.5 pointer-events-none`}>
        P{tile.ownerId + 1}
      </div>
    );
  };

  const renderBuildingIndicator = () => {
    if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
    
    let indicator = null;
    if (tile.buildingLevel === 1) {
        indicator = <span className="text-[8px] md:text-xl lg:text-2xl filter drop-shadow-md">🏠</span>;
    } else if (tile.buildingLevel === 2) {
        indicator = <span className="text-[10px] md:text-2xl lg:text-3xl filter drop-shadow-md">🏢</span>;
    } else if (tile.buildingLevel === 3) {
        // Landmark Icon
        indicator = <span className="text-[10px] md:text-2xl lg:text-3xl filter drop-shadow-md animate-pulse">🏰</span>;
    }

    if (!indicator) return null;

    return (
       <div className="absolute top-0 right-0 p-0.5 z-20 leading-none pointer-events-none">
          {indicator}
       </div>
    );
  };

  const renderBuildingStars = () => {
      if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
      
      if (tile.buildingLevel === 3) {
         return <span className="text-[6px] md:text-[10px] lg:text-xs font-extrabold text-yellow-300 bg-black/30 px-1 rounded whitespace-nowrap">LANDMARK</span>;
      }

      const stars = [];
      for(let i=0; i<tile.buildingLevel; i++) {
          stars.push(<span key={i}>⭐</span>);
      }
      
      if (stars.length === 0) {
        return <span className="text-[6px] md:text-[10px] lg:text-xs font-extrabold text-slate-700 bg-white/50 px-0.5 rounded whitespace-nowrap">토지</span>;
      }
      return <div className="flex gap-px text-[6px] md:text-[10px] lg:text-xs justify-center">{stars}</div>;
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-between p-[1px] md:p-1 w-full h-full border rounded md:rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer select-none overflow-hidden ${containerClasses}`}
      onClick={() => onClick(tile)}
    >
      {renderOwnerBadge()}
      {renderBuildingIndicator()}

      {/* Header: Name */}
      <div className="flex-shrink-0 w-full text-center pt-1 md:pt-1 z-10 px-px">
         <div className={`text-[7px] md:text-xs lg:text-sm xl:text-base font-black tracking-tight ${nameColorClass} break-words whitespace-normal leading-[9px] md:leading-tight`}>
            {tile.name}
         </div>
      </div>

      {/* Center: Icon (Shrinkable) */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 overflow-hidden relative z-0">
        {/* Adjusted sizes: md:text-3xl instead of 5xl to fit on laptops */}
        <span className="text-sm sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl drop-shadow-md leading-none py-0.5">
            {iconDisplay}
        </span>
      </div>
      
      {/* Footer Info: Price or Desc */}
      <div className="flex-shrink-0 w-full flex flex-col items-center justify-center px-px pb-0.5 z-10">
           {tile.type === TileType.CITY ? (
               tile.ownerId !== null ? renderBuildingStars() : <span className={`font-extrabold text-[7px] md:text-xs lg:text-sm px-0.5 rounded-full shadow-sm tracking-tighter leading-none ${priceColorClass}`}>{tile.price}</span>
           ) : (
               <span className="block text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs text-gray-900 font-bold text-center leading-tight break-words px-px bg-white/40 rounded w-full line-clamp-2 md:line-clamp-none">
                   {tile.description}
               </span>
           )}
      </div>

      {/* Footer: Players present */}
      <div className="flex-shrink-0 flex flex-wrap justify-center gap-[1px] md:gap-1.5 w-full min-h-[4px] md:min-h-[20px] lg:min-h-[24px] items-end pb-0.5 px-px z-10">
        {playersOnTile.map(p => (
          <div 
            key={p.id} 
            className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full border border-white shadow-lg ${p.color} ring-[0.5px] ring-black/20`} 
            title={p.name}
          />
        ))}
      </div>
    </div>
  );
};

export default TileComponent;
