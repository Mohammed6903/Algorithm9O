import numpy as np
import torch

test_array = np.array([1, 2, 3])
try:
    torch.from_numpy(test_array)
    print("torch.from_numpy works successfully")
except Exception as e:
    print(f"torch.from_numpy failed: {e}")