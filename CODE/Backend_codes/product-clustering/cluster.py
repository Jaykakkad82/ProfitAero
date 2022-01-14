import hdbscan
import pickle
import pandas as pd
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from sklearn.cluster import DBSCAN, AgglomerativeClustering, SpectralClustering, KMeans
from scipy.spatial.distance import cdist
from sklearn.metrics import silhouette_score
import numpy as np
from tqdm import tqdm

def cluster(embeds, hp=0.5, option=1):
    clusterers = [DBSCAN(eps=hp, min_samples=20),AgglomerativeClustering(n_clusters=50),SpectralClustering(50, affinity='rbf', n_init=100, assign_labels='discretize'),KMeans(n_clusters=50, random_state=0)]
    clusterers[option].fit(embeds)
    # dist = sum(np.min(cdist(embeds, clusterers[option].cluster_centers_,
    #                                     'euclidean'), axis=1)) / embeds.shape[0]
    score = silhouette_score(embeds,clusterers[option].labels_)
    print(score)
    return clusterers[option].labels_, score

def get_names(items, labels):
    item_dict={}
    for i in range(len(items)):
        if labels[i] not in item_dict.keys():
            item_dict[labels[i]] = []
        item_dict[labels[i]].append(str(items[i]).lower())
    names=[]
    keys = list(item_dict.keys())
    for key in keys:
        st = " ".join(item_dict[key])
        all_words = st.split(' ')
        distinct_words = list(set(all_words))
        li = [all_words.count(i) for i in distinct_words]
        name = distinct_words[li.index(max(li))]
        names.append(name)
    return names, keys

def update_dict(inds, labels, d):
    for i in range(len(inds)):
        d[inds[i]] = labels[i]
    return d


# def recursive_clustering(embeds):
#     labels = cluster(embeds)
#     keys = list(set(labels))
#     counts = [ labels.count(i) for i in keys]
#     d = {}
#     d = update_dict([i in range(len(labels))], labels, d)
#     for key_ind in range(len(keys)):
#

def write_labels(items,labels):
    names, keys = get_names(items,labels)
    cluster_names = [ names[keys.index(i)] for i in labels]
    df = pd.DataFrame(data={"items":items, "labels":labels, "names": cluster_names})
    df.to_csv("categories.txt")
    labels = labels.tolist()
    pd.DataFrame(data={"names": names, "ids": keys, "count": [ labels.count(i) for i in keys]}).to_csv("labels.txt")

def get_embeds():
    with open("embeds.pkl", 'rb') as f:
        contents = pickle.load(f)
        embeds, items = contents['embeds'], contents['items']
        print(len(embeds),len(items))
        return embeds, items

def cluster_write():
    embeds, items = get_embeds()
    algos = ["DBSCAN","Agglomerative","Spectral","Kmeans"]
    dists = []
    objs = []
    for i in tqdm(range(len(algos))):
        labels, dist = cluster(embeds,option=i)
        dists.append(dist)
        objs.append((labels, dist))
    df = pd.DataFrame()
    df["name"] = algos
    df["distortion"] = dists
    df.to_csv("res.csv")
    with open("clust_res.pkl",'wb') as f:
        pickle.dump(f)
    # counts = [labels.count(i) for i in list(set(labels))]
    # filter_zip = [i for i in zip(labels,counts) if i[1]>100]
    # embeds = [embeds[i] for i in range(len(labels)) if labels[i]==filter_zip[0][0]]
    # items = [items[i] for i in range(len(labels)) if labels[i]==filter_zip[0][0]]
    # labels = cluster(embeds)
    # write_labels(items, labels)

def visualize_embeddings():
    embs, items = get_embeds()
    tsne = TSNE(random_state=1, n_iter=15000, metric="cosine")
    embs = tsne.fit_transform(embs)
    # Add to dataframe for convenience
    df = pd.DataFrame()
    df['x'] = embs[:, 0]
    df['y'] = embs[:, 1]
    FS = (10, 8)
    fig, ax = plt.subplots(figsize=FS)
    # Make points translucent so we can visually identify regions with a high density of overlapping points
    ax.scatter(df.x, df.y, alpha=.1)
    plt.savefig("tsne.png")
    plt.show()

cluster_write()
# visualize_embeddings()