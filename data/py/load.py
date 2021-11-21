import numpy as np
import json

data = np.load("../features_cub/relationship.npy")
list_data = data.tolist()

# left_size = len(list_data)
right_size = len(list_data[0])
left_size = 5
# right_size = 10

left_name = ["l" + str(i) for i in range(left_size)]
right_name = ["r" + str(i) for i in range(right_size)]



with open("../data.js", "w") as f:
    f.write("var showData=[\n")
    for i in range(left_size):
        for j in range(right_size):
            f.write("[\"%s\",\"%s\",%.8f],\n"%(left_name[i], right_name[j], list_data[i][j] if list_data[i][j] != 0 else 0.001))
    f.write("];\n")