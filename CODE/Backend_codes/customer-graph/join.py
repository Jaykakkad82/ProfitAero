import pickle
import pandas as pd
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

df = pd.read_csv("processed_data_full.csv",index_col=False)
df1 = pd.read_csv("data/Customer_View.csv",index_col=False)
FS = (10, 8)
fig, ax = plt.subplots(figsize=FS)
# Make points translucent so we can visually identify regions with a high density of overlapping points
ax.scatter(df.x, df.y, alpha=.1)
plt.show()
print(df1.columns)
df = df.merge(df1, on="Customer ID", how="inner")
df = df.drop(columns=["Unnamed: 0"])
print(df.columns)
df.to_csv("cust_full.csv",index=None)
