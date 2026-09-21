import tensorflow as tf
import numpy as np

# Training data
x = np.array([1, 2, 3, 4, 5], dtype=float)
y = np.array([3, 5, 7, 9, 11], dtype=float)

# Create a simple model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(1, input_shape=[1])
])

# Compile the model
model.compile(
    optimizer='sgd',
    loss='mean_squared_error'
)

# Train the model
model.fit(x, y, epochs=500, verbose=0)

# Test the model
result = model.predict([50])
print("Prediction for x=50:", result)