import pandas as pd

df = pd.read_csv("joined.csv")
df = df.sample(20)
ids = df["Customer ID"].tolist()
# ids = [i.trim() for i in ids]
df.to_csv("cust_sample.csv", index=False)

df1 = pd.read_csv("/Users/aswin/Downloads/CustomerView_DummyData2.csv")
cols = ['Customer ID'] + list(map(str,ids))
df1 = df1[cols]
df1 = df1[df1['Customer ID'].isin(ids)]
print(df1.shape)
df1.to_csv("edges_sample.csv", index=False)