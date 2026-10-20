<?php
/**
 * Validator Utility Class
 * Dice & Deck Tabletop Shop
 */

class Validator
{
    private array $errors = [];

    /**
     * Validate required field
     *
     * @param mixed $value
     * @param string $fieldName
     * @return self
     */
    public function required($value, string $fieldName): self
    {
        if (empty($value) && $value !== '0' && $value !== 0) {
            $this->errors[$fieldName] = ucfirst($fieldName) . ' is required';
        }
        return $this;
    }

    /**
     * Validate email format
     *
     * @param string $email
     * @param string $fieldName
     * @return self
     */
    public function email(string $email, string $fieldName = 'email'): self
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$fieldName] = 'Invalid email format';
        }
        return $this;
    }

    /**
     * Validate minimum length
     *
     * @param string $value
     * @param int $minLength
     * @param string $fieldName
     * @return self
     */
    public function minLength(string $value, int $minLength, string $fieldName): self
    {
        if (mb_strlen($value) < $minLength) {
            $this->errors[$fieldName] = ucfirst($fieldName) . " must be at least {$minLength} characters";
        }
        return $this;
    }

    /**
     * Validate maximum length
     *
     * @param string $value
     * @param int $maxLength
     * @param string $fieldName
     * @return self
     */
    public function maxLength(string $value, int $maxLength, string $fieldName): self
    {
        if (mb_strlen($value) > $maxLength) {
            $this->errors[$fieldName] = ucfirst($fieldName) . " must not exceed {$maxLength} characters";
        }
        return $this;
    }

    /**
     * Validate phone number (Ukrainian format)
     *
     * @param string $phone
     * @param string $fieldName
     * @return self
     */
    public function phone(string $phone, string $fieldName = 'phone'): self
    {
        $pattern = '/^\+?3?8?0\d{9}$/';
        if (!preg_match($pattern, $phone)) {
            $this->errors[$fieldName] = 'Invalid phone number format';
        }
        return $this;
    }

    /**
     * Validate numeric value
     *
     * @param mixed $value
     * @param string $fieldName
     * @return self
     */
    public function numeric($value, string $fieldName): self
    {
        if (!is_numeric($value)) {
            $this->errors[$fieldName] = ucfirst($fieldName) . ' must be a number';
        }
        return $this;
    }

    /**
     * Validate integer value
     *
     * @param mixed $value
     * @param string $fieldName
     * @return self
     */
    public function integer($value, string $fieldName): self
    {
        if (!is_int($value) && !ctype_digit(strval($value))) {
            $this->errors[$fieldName] = ucfirst($fieldName) . ' must be an integer';
        }
        return $this;
    }

    /**
     * Validate value is within range
     *
     * @param numeric $value
     * @param numeric $min
     * @param numeric $max
     * @param string $fieldName
     * @return self
     */
    public function range($value, $min, $max, string $fieldName): self
    {
        if ($value < $min || $value > $max) {
            $this->errors[$fieldName] = ucfirst($fieldName) . " must be between {$min} and {$max}";
        }
        return $this;
    }

    /**
     * Validate value is in allowed list
     *
     * @param mixed $value
     * @param array $allowedValues
     * @param string $fieldName
     * @return self
     */
    public function inArray($value, array $allowedValues, string $fieldName): self
    {
        if (!in_array($value, $allowedValues, true)) {
            $allowed = implode(', ', $allowedValues);
            $this->errors[$fieldName] = ucfirst($fieldName) . " must be one of: {$allowed}";
        }
        return $this;
    }

    /**
     * Validate array field
     *
     * @param mixed $value
     * @param string $fieldName
     * @return self
     */
    public function isArray($value, string $fieldName): self
    {
        if (!is_array($value)) {
            $this->errors[$fieldName] = ucfirst($fieldName) . ' must be an array';
        }
        return $this;
    }

    /**
     * Validate array is not empty
     *
     * @param array $value
     * @param string $fieldName
     * @return self
     */
    public function notEmptyArray(array $value, string $fieldName): self
    {
        if (empty($value)) {
            $this->errors[$fieldName] = ucfirst($fieldName) . ' cannot be empty';
        }
        return $this;
    }

    /**
     * Add custom error
     *
     * @param string $fieldName
     * @param string $message
     * @return self
     */
    public function addError(string $fieldName, string $message): self
    {
        $this->errors[$fieldName] = $message;
        return $this;
    }

    /**
     * Check if validation passed
     *
     * @return bool
     */
    public function passes(): bool
    {
        return empty($this->errors);
    }

    /**
     * Check if validation failed
     *
     * @return bool
     */
    public function fails(): bool
    {
        return !$this->passes();
    }

    /**
     * Get all validation errors
     *
     * @return array
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Static method to create validator instance
     *
     * @return self
     */
    public static function make(): self
    {
        return new self();
    }

    /**
     * Validate order data
     *
     * @param array $data
     * @return array|null Returns errors array or null if valid
     */
    public static function validateOrder(array $data): ?array
    {
        $validator = self::make();

        // Required fields
        $validator->required($data['fullName'] ?? '', 'fullName')
                  ->minLength($data['fullName'] ?? '', 2, 'fullName');

        $validator->required($data['phone'] ?? '', 'phone')
                  ->phone($data['phone'] ?? '', 'phone');

        $validator->required($data['deliveryService'] ?? '', 'deliveryService')
                  ->inArray($data['deliveryService'] ?? '', ['nova_poshta', 'ukr_poshta'], 'deliveryService');

        $validator->required($data['city'] ?? '', 'city');
        $validator->required($data['branch'] ?? '', 'branch');

        $validator->required($data['paymentMethod'] ?? '', 'paymentMethod')
                  ->inArray($data['paymentMethod'] ?? '', ['cash_on_delivery', 'online'], 'paymentMethod');

        // Duration hours validation
        if (isset($data['durationHours'])) {
            $validator->integer($data['durationHours'], 'durationHours')
                      ->range($data['durationHours'], 1, 8, 'durationHours');

            // If duration > 4 hours, consultation is required
            if ($data['durationHours'] > 4 && empty($data['needsConsultation'])) {
                $validator->addError('needsConsultation', 'Consultation is required for rentals longer than 4 hours');
            }
        }

        // Validate ordered items
        if (!isset($data['orderedItems']) || !is_array($data['orderedItems'])) {
            $validator->addError('orderedItems', 'Ordered items are required');
        } elseif (empty($data['orderedItems'])) {
            $validator->addError('orderedItems', 'At least one item is required');
        } else {
            foreach ($data['orderedItems'] as $index => $item) {
                if (empty($item['gameId'])) {
                    $validator->addError("orderedItems[{$index}].gameId", 'Game ID is required');
                }
                if (empty($item['title'])) {
                    $validator->addError("orderedItems[{$index}].title", 'Title is required');
                }
                if (!isset($item['price']) || !is_numeric($item['price'])) {
                    $validator->addError("orderedItems[{$index}].price", 'Valid price is required');
                }
                if (!isset($item['quantity']) || $item['quantity'] < 1) {
                    $validator->addError("orderedItems[{$index}].quantity", 'Quantity must be at least 1');
                }
            }
        }

        return $validator->fails() ? $validator->getErrors() : null;
    }

    /**
     * Validate user registration data
     *
     * @param array $data
     * @return array|null Returns errors array or null if valid
     */
    public static function validateRegistration(array $data): ?array
    {
        $validator = self::make();

        $validator->required($data['name'] ?? '', 'name')
                  ->minLength($data['name'] ?? '', 2, 'name');

        $validator->required($data['email'] ?? '', 'email')
                  ->email($data['email'] ?? '', 'email');

        $validator->required($data['password'] ?? '', 'password')
                  ->minLength($data['password'] ?? '', 6, 'password');

        if (!empty($data['phone'])) {
            $validator->phone($data['phone'], 'phone');
        }

        return $validator->fails() ? $validator->getErrors() : null;
    }

    /**
     * Validate login data
     *
     * @param array $data
     * @return array|null Returns errors array or null if valid
     */
    public static function validateLogin(array $data): ?array
    {
        $validator = self::make();

        $validator->required($data['email'] ?? '', 'email')
                  ->email($data['email'] ?? '', 'email');

        $validator->required($data['password'] ?? '', 'password');

        return $validator->fails() ? $validator->getErrors() : null;
    }
}
