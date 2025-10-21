import pandas as pd
from sklearn.linear_model import LinearRegression
import pickle

# Baca data harga
df = pd.read_csv('data/harga_bapanas.csv')

# Ubah tanggal ke format numerik (misal ordinal)
df['tanggal_num'] = pd.to_datetime(df['tanggal']).map(lambda x: x.toordinal())

# Pilih komoditas (misal Beras Premium)
komoditas = 'Beras Premium'
df_komoditas = df[df['komoditas'] == komoditas]

# Siapkan fitur dan target
X = df_komoditas[['tanggal_num']]
y = df_komoditas['harga']

# Latih model
model = LinearRegression()
model.fit(X, y)

# Simpan model
with open(f'model_{komoditas.replace(" ", "_")}.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Model berhasil dilatih dan disimpan.")