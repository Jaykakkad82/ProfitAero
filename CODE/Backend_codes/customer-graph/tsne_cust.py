import pickle
import pandas as pd
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from tqdm import tqdm

def get_embeds(df):
    custs = list(set(df.Customers_x.tolist()))
    matrix = [[0 for i in range(len(custs))] for j in range(len(custs))]
    for row in tqdm(df.values.tolist()):
        [x,y,w] = row
        matrix[custs.index(x)][custs.index(y)] = w
    df1 = pd.DataFrame(data=matrix, columns=custs)
    df1["Customer ID"] = custs
    df1.to_csv("edges_full.csv",index=None)
    return df1

df = pd.read_csv("data/graph_edge.csv")
df1 = get_embeds(df)
# print(cols)
df = df1.drop(columns=["Customer ID"])
embeds = df.values.tolist()
print(embeds[:10])
tsne = TSNE(random_state=1, n_iter=15000, metric="cosine")
embs = tsne.fit_transform(embeds)
# Add to dataframe for convenience
# new_df = pd.DataFrame()
new_df = df1[["Customer ID"]]
new_df['x'] = embs[:, 0]
new_df['y'] = embs[:, 1]
FS = (10, 8)
fig, ax = plt.subplots(figsize=FS)
# Make points translucent so we can visually identify regions with a high density of overlapping points
ax.scatter(new_df.x, new_df.y, alpha=.1)
plt.savefig("tsne_1.png")
plt.show()
new_df.to_csv("processed_data_full.csv",index=False)