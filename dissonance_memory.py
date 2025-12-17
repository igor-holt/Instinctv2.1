import time
import heapq
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

# --- Widget for Research Paper [1]: Dissonance-Weighted Eviction ---
# DOI: 10.5281/zenodo.17784838

@dataclass(order=True)
class MemoryItem:
    """
    Represents a stored memory item with a computed eviction score.
    Lower score = Higher likelihood of eviction.
    """
    eviction_score: float
    timestamp: float
    key: str = field(compare=False)
    value: Any = field(compare=False)
    dissonance: float = field(compare=False) # 0.0 (Resolved) to 1.0 (Highly Conflictual)

class DissonanceCache:
    """
    Implements the Hybrid LRU Protocol.
    
    Unlike standard LRU which only cares about 'when' an item was last used,
    Dissonance-Weighted Eviction protects items that are 'unresolved' or 'high dissonance',
    even if they are old. This mimics biological memory consolidation of traumatic/novel events.
    """
    
    def __init__(self, capacity: int, alpha_decay: float = 0.5):
        self.capacity = capacity
        self.alpha = alpha_decay
        self.cache: Dict[str, MemoryItem] = {}
        self.access_counter = 0

    def _calculate_score(self, last_access_time: float, dissonance: float) -> float:
        """
        The Core Equation from Paper [1].
        Combines Recency (Standard LRU) with Dissonance (Priority).
        
        Score = (1 / (Time_Delta + epsilon)) + (Weight * Dissonance)
        High Score -> KEEP. Low Score -> EVICT.
        """
        current_time = time.time()
        time_delta = current_time - last_access_time
        
        # Recency Component (Standard LRU)
        recency_score = 1.0 / (time_delta + 1e-5)
        
        # Dissonance Component (The Research Innovation)
        # We protect high dissonance items from eviction.
        dissonance_weight = 10.0 # Configurable hyperparameter
        
        return recency_score + (dissonance * dissonance_weight)

    def put(self, key: str, value: Any, dissonance: float = 0.1):
        """Insert item with a specific 'cognitive dissonance' score."""
        if len(self.cache) >= self.capacity:
            self._evict()
            
        item = MemoryItem(
            eviction_score=0, # Placeholder, calc below
            timestamp=time.time(),
            key=key,
            value=value,
            dissonance=dissonance
        )
        self.cache[key] = item
        self._update_scores() # In production, use a heap for O(1) access

    def get(self, key: str) -> Optional[Any]:
        if key in self.cache:
            item = self.cache[key]
            item.timestamp = time.time() # Update Recency
            # In a real agent, accessing a memory might resolve its dissonance
            # item.dissonance *= 0.9 
            self._update_scores()
            return item.value
        return None

    def _evict(self):
        """Finds the item with the LOWEST score (Least Relevant + Least Dissonant)."""
        if not self.cache:
            return
            
        # Re-evaluate all scores (O(N) - Simplified for widget demo)
        self._update_scores()
        
        # Find minimum score
        victim_key = min(self.cache.values(), key=lambda x: x.eviction_score).key
        print(f"[Eviction Event] Removing '{victim_key}' (Low Relevance/Low Dissonance)")
        del self.cache[victim_key]

    def _update_scores(self):
        for item in self.cache.values():
            item.eviction_score = self._calculate_score(item.timestamp, item.dissonance)

# --- Verification Run ---
if __name__ == "__main__":
    print("--- Dissonance-Weighted Eviction Protocol ---")
    mem = DissonanceCache(capacity=3)
    
    print("1. Adding 'Breakfast' (Low Dissonance - Routine)")
    mem.put("Breakfast", "Toast", dissonance=0.1)
    time.sleep(0.1)
    
    print("2. Adding 'Anomaly_A' (High Dissonance - Unresolved Error)")
    mem.put("Anomaly_A", "Error_404", dissonance=0.9) 
    time.sleep(0.1)
    
    print("3. Adding 'Lunch' (Low Dissonance - Routine)")
    mem.put("Lunch", "Sandwich", dissonance=0.1)
    time.sleep(0.1)
    
    print("4. Cache Full. Adding 'Dinner'. Who gets evicted?")
    # Standard LRU would evict 'Breakfast' (Oldest).
    # Dissonance LRU should protect 'Anomaly_A' even if it's old, 
    # and evict 'Breakfast' or 'Lunch' depending on the weight.
    mem.put("Dinner", "Pizza", dissonance=0.1)
    
    print(f"Remaining Memory: {list(mem.cache.keys())}")

