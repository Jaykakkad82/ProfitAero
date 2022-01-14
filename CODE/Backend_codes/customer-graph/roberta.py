from transformers import RobertaTokenizer, RobertaConfig, RobertaModel
import pandas as pd
import pickle
import numpy as np
from tqdm import tqdm

def get_model():
    model = RobertaModel.from_pretrained("/Users/aswin/Downloads/roberta-large")
    tokenizer = RobertaTokenizer.from_pretrained("/Users/aswin/Downloads/roberta-large")
    return model, tokenizer

def get_embed(sentences, model, tokenizer):
    batches = np.array_split(sentences, (len(sentences)//32)+1)
    embeds = []
    for batch in tqdm(batches):
        tokens = tokenizer.batch_encode_plus(batch, return_tensors="pt", padding="longest")
        outputs = model(tokens.input_ids)
        embeds.extend(outputs[1].detach().numpy().tolist())
    return embeds

def get_file():
    df = pd.read_csv("/Users/aswin/Downloads/Prod_Map.csv")
    df = df.dropna(subset=["Description"])
    df["Description"] = df["Description"].apply(lambda x: x.lower())
    print(df.head(10))
    return df.Description.to_list()

items = get_file()
items = list(set(items))
# items=items[:100]
model, tokenizer = get_model()
embeds = get_embed(items, model, tokenizer)
with open("embeds.pkl", 'wb') as f:
    pickle.dump({"embeds": embeds, "items": items},f)