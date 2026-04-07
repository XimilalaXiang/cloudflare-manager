package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ximilala/cloudflare-manager/internal/services"
)

type AccountHandler struct {
	service *services.AccountService
}

func NewAccountHandler(service *services.AccountService) *AccountHandler {
	return &AccountHandler{service: service}
}

type CreateAccountRequest struct {
	Name      string `json:"name" binding:"required"`
	Email     string `json:"email"`
	AccountID string `json:"account_id" binding:"required"`
	APIToken  string `json:"api_token" binding:"required"`
}

func (h *AccountHandler) Create(c *gin.Context) {
	var req CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	account, err := h.service.Create(req.Name, req.Email, req.AccountID, req.APIToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, account)
}

func (h *AccountHandler) List(c *gin.Context) {
	accounts, err := h.service.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, accounts)
}

func (h *AccountHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	account, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "account not found"})
		return
	}
	c.JSON(http.StatusOK, account)
}

type UpdateAccountRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	APIToken string `json:"api_token"`
}

func (h *AccountHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req UpdateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	account, err := h.service.Update(uint(id), req.Name, req.Email, req.APIToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, account)
}

func (h *AccountHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "account deleted"})
}

func (h *AccountHandler) Verify(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	status, err := h.service.Verify(uint(id))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": status, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": status})
}
