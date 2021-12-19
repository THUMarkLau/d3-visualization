import numpy as np
import json

data = np.load("../features_cub/relationship.npy")
left_size = data.shape[0]
right_size = data.shape[1]
list_data = data.tolist()
right_name = np.load("../features_cub/imagenet_classes.npy")
left_name = np.load("../features_cub/cub_classes.npy")
left_name = left_name.tolist()
right_name = right_name.tolist()

a = "Black_and_white_Warbler"
print(a in left_name)

with open("../origin_data.js", "w") as f:
    f.write("var left_cnt=" + str(left_size) + "\n")
    f.write("var right_cnt=" + str(right_size) + "\n")
    f.write("var origin_data=[\n")
    for i in range(left_size):
        for j in range(right_size):
            f.write("[\"%s\",\"%s\",%.8f],\n"%(left_name[i], right_name[j], list_data[i][j] if list_data[i][j] != 0 else 0.001))
    f.write("];\n")